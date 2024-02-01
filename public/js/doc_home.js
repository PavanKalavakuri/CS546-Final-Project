const scheduleElements = {};
const scheduleArray = [];
let PAGE = 0;

let newApptmnts = []
let pastApptmnts = []
let mainApptmnt = undefined;

const createRemainingSchedule = (count, curDate, schedules) => {
    while (count--) {
        const daySchedule = {
            day: curDate.format('DD'),
            month: curDate.format('MM'),
            year: curDate.format('Y'),
            dayOfWeek: curDate.format('ddd'),
            monthName: curDate.format('MMM'),
            available: true,
            startDay: '09:00',
            endDay: '18:00',
            sessionTime: 30,
            breakTimes: [],
            workTimes: []
        }
        schedules.push(daySchedule);
        curDate.add(1, 'days');
    }
};

const checkAndFillSchedules = (schedules) => {
    let index = 0;
    let count = 14;
    let curDate = moment();
    while (index < schedules.length) {
        if (count < 1) {
            schedules.splice(index);
            break;
        }
        let curDateStr = `${curDate.format('Y')}-${curDate.format('MM')}-${curDate.format('DD')}`;
        let schdlObj = schedules[index];
        let schdlDateStr = `${schdlObj.year}-${schdlObj.month}-${schdlObj.day}`;
        if (curDateStr === schdlDateStr) {
            count--;
            curDate.add(1, 'days');
            index++;
        } else {
            schedules.splice(index, 1);
        }
    }
    if (count > 0) {
        createRemainingSchedule(count, curDate, schedules);
    }
};

const generateSlotTimes = (sessionTime) => {
    const allSlotTimes = [];
    let mins = 0;
    for (let hr = 0; hr < 24; hr++) {
        while (mins < 60) {
            let value = `${hr.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
            allSlotTimes.push(value);
            mins += sessionTime;
        }
        mins -= 60;
    }
    return allSlotTimes;
};

const createSlotElements = (schdl, allSlotTimes) => {
    const slotElements = [];
    const intervalSlots = allSlotTimes.filter(tSlot => schdl.startDay <= tSlot && tSlot <= schdl.endDay);
    intervalSlots.forEach(tSlot => {
        const slotButton = $('<button>');
        if (schdl.breakTimes.includes(tSlot)) {
            slotButton.addClass('slot btn btn-outline-danger active btn-sm rounded-0 my-1');
        } else if (schdl.workTimes.includes(tSlot)) {
            slotButton.addClass('slot btn btn-success active btn-sm rounded-0 my-1');
            slotButton.prop('disabled', true);
        } else {
            slotButton.addClass('slot btn btn-outline-success btn-sm rounded-0 my-1');
        }
        slotButton.text(tSlot);
        slotElements.push(slotButton);
    });
    return slotElements;
};

const createScheduleElements = (schedules) => {
    schedules.forEach(schdl => {
        schdl.available = JSON.parse(schdl.available);
        schdl.sessionTime = JSON.parse(schdl.sessionTime);
        if (!schdl.breakTimes) schdl.breakTimes = [];
        if (!schdl.workTimes) schdl.workTimes = [];
        const dayStr = `${schdl.monthName}${schdl.day}`;
        scheduleArray.push(dayStr);
        const allSlotTimes = generateSlotTimes(schdl.sessionTime);
        const slotElements = createSlotElements(schdl, allSlotTimes);
        scheduleElements[dayStr] = {
            ...schdl,
            allSlotTimes,
            slotElements,
        }
    });
};

const renderDayLabels = (day, schdl) => {
    $(`#labelDay${day}`).text(`${schdl.monthName} ${schdl.day} ${schdl.dayOfWeek}`);
    $(`#labelSlotsDay${day}`).html(`${schdl.monthName} ${schdl.day} <p>${schdl.dayOfWeek}</p>`);
};

const renderDayInfo = (day, {
    available,
    startDay,
    endDay,
    allSlotTimes
}) => {
    $(`#switchDay${day}`).prop('checked', available);
    $(`#labelSwitchDay${day}`).text(available ? 'Available' : 'Unavailable');
    $(`#startDay${day}`).empty();
    $(`#endDay${day}`).empty();
    allSlotTimes.forEach(tSlot => {
        $(`#startDay${day}`).append(`<option ${tSlot===startDay ? 'selected':''} value=${tSlot}>${tSlot}</option>`);
        $(`#endDay${day}`).append(`<option ${tSlot===endDay ? 'selected':''} value=${tSlot}>${tSlot}</option>`);
    });
};

const renderDaySession = (day, {
    sessionTime
}) => {
    $(`#sessionDay${day}`).empty();
    const sessionTimes = [10, 15, 20, 30, 40, 60];
    sessionTimes.forEach(time => $(`#sessionDay${day}`).append(`<option ${time===sessionTime ? 'selected':''} value=${time.toString().padStart(2, "0")}>${time.toString().padStart(2, "0")}</option>`));
};

const renderDaySlots = (day, {
    available,
    slotElements
}) => {
    $(`#slotsDay${day}`).empty();
    if (available) slotElements.forEach(slotButton => $(`#slotsDay${day}`).append(slotButton));
};

const displaySchedule = (page) => {
    for (let index = 0; index < 7; index++) {
        const dayStr = scheduleArray[index + page * 7];
        const schdl = scheduleElements[dayStr];
        renderDayLabels(index + 1, schdl);
        renderDayInfo(index + 1, schdl);
        renderDaySession(index + 1, schdl);
        renderDaySlots(index + 1, schdl);
    }
};

const loadSchedules = () => {
    $.get('/doctor/data', ({
        schedules
    }) => {
        console.log(schedules);
        checkAndFillSchedules(schedules);
        createScheduleElements(schedules);
        displaySchedule(PAGE);
    });
};

const initializeAppointments = (apptmnts) => {
    newApptmnts = []
    pastApptmnts = []
    mainApptmnt = undefined;
    const now = moment();
    apptmnts.forEach(apptmnt => {
        const apptmntTime = moment(apptmnt.time);
        if (now < apptmntTime) {
            apptmnt.type = 'new';
            newApptmnts.push(apptmnt);
        } else {
            apptmnt.type = 'past';
            pastApptmnts.push(apptmnt);
        }
    });
    newApptmnts.sort((apptmnt1, apptmnt2) => {
        return moment(apptmnt1.time) < moment(apptmnt2.time) ? 1 : -1;
    });
    pastApptmnts.sort((apptmnt1, apptmnt2) => {
        return moment(apptmnt1.time) < moment(apptmnt2.time) ? 1 : -1;
    });
    mainApptmnt = newApptmnts[0] || pastApptmnts[0];
};

const addApptmntListener = (a) => {
    a.on('click', function (e) {
        e.preventDefault();
        const elementId = $(this).attr('id');
        const type = elementId.split('_')[0];
        const index = parseInt(elementId.split('_')[2]);
        mainApptmnt = type === 'new' ? newApptmnts[index] : pastApptmnts[index];
        updateApptmntSection();
    });
};

const createAppointmentElements = (parent, apptmnts) => {
    parent.empty();
    if (apptmnts[0]) {
        $(`#no_${apptmnts[0].type}_apptmnt_h4`).hide();
    }
    apptmnts.forEach((apptmnt, index) => {
        const indexStr = index.toString().padStart(3, "0");
        const a = $('<a>').addClass("apptmnt dropdown-item p-0").attr('id', `${apptmnt.type}_apptmnt_${indexStr}`);
        const div1 = $("<div>").addClass("card-body border");
        const p1 = $("<p>").text(apptmnt.patient_name);
        const p2 = $("<p>").addClass("small text-muted").text(`${apptmnt.patient_age} ${apptmnt.patient_gender}`);
        const p3 = $("<p>").addClass("small mt-2").text(apptmnt.time_string);
        a.append(div1.append(p1).append(p2).append(p3));
        addApptmntListener(a);
        parent.append(a);
    });
};

const createAppointments = () => {
    createAppointmentElements($("#new_apptmnts"), newApptmnts);
    createAppointmentElements($("#past_apptmnts"), pastApptmnts);
};

const updateApptmntSection = () => {
    if (mainApptmnt) {
        $("#no_apptmnt_h3").hide();
        $('#pat_name').text(mainApptmnt.patient_name);
        $('#pat_reason').text(mainApptmnt.patient_reason);
        $('#appt_time').text(mainApptmnt.time_string);
        $('#appt_notes').text(mainApptmnt.patient_notes);
        $('#appt_presc').text(mainApptmnt.prescription);
        $('#pat_gen').text(mainApptmnt.patient_gender);
        $('#pat_age').text(mainApptmnt.patient_age);
        $('#appt_dur').text(mainApptmnt.duration);
        if (mainApptmnt.type === 'new') {
            $('#reschdl_btn').show();
            $('#cncl_btn').show();
            $('#revw_btn').hide();
        } else {
            $('#reschdl_btn').hide();
            $('#cncl_btn').hide();
            $('#revw_btn').show();
        }
        $("#apptmnt_view").show();
    } else {
        $("#apptmnt_view").hide();
        $("#no_apptmnt_h3").show();
    }
};

const loadAppointments = () => {
    $.get('/appointment', ({
        apptmnts
    }) => {
        console.log(apptmnts);
        initializeAppointments(apptmnts);
        createAppointments();
        updateApptmntSection();
    });
};

loadSchedules();
loadAppointments();

$('#prevPage').on('click', function (e) {
    e.preventDefault();
    if (PAGE === 1) {
        PAGE = 0;
        displaySchedule(PAGE);
    }
});

$('#nextPage').on('click', function (e) {
    e.preventDefault();
    if (PAGE === 0) {
        PAGE = 1;
        displaySchedule(PAGE);
    }
});

$('.switchDay').on('change', function () {
    const available = !!this.checked;
    const elementId = $(this).attr('id');
    const day = elementId[elementId.length - 1];
    const dayStr = scheduleArray[day - 1 + PAGE * 7];
    const schdl = scheduleElements[dayStr];
    schdl.available = available;
    $(`#labelSwitchDay${day}`).text(available ? 'Available' : 'Unavailable');
    renderDaySlots(day, schdl);
});

$('.sessionDay').on('change', function () {
    const sessionTime = parseInt(this.value);
    const elementId = $(this).attr('id');
    const day = elementId[elementId.length - 1];
    const dayStr = scheduleArray[day - 1 + PAGE * 7];
    const schdl = scheduleElements[dayStr];
    schdl.sessionTime = sessionTime;
    schdl.allSlotTimes = generateSlotTimes(sessionTime);
    schdl.slotElements = createSlotElements(schdl, schdl.allSlotTimes);
    renderDayInfo(day, schdl);
    renderDaySlots(day, schdl);
});

$('.startEndDay').on('change', function () {
    const elementId = $(this).attr('id');
    const day = elementId[elementId.length - 1];
    const dayStr = scheduleArray[day - 1 + PAGE * 7];
    const schdl = scheduleElements[dayStr];
    schdl.startDay = $(`#startDay${day}`)[0].value;
    schdl.endDay = $(`#endDay${day}`)[0].value;
    schdl.slotElements = createSlotElements(schdl, schdl.allSlotTimes);
    renderDaySlots(day, schdl);
});

$(document).on({
    mouseenter: function () {
        if (!$(this).prop('disabled')) {
            $(this).removeClass('btn-outline-success');
            $(this).addClass('btn-outline-danger');
        }
    },
    mouseleave: function () {
        if (!$(this).prop('disabled') && !$(this).hasClass('active')) {
            $(this).removeClass('btn-outline-danger');
            $(this).addClass('btn-outline-success');
        }
    },
    click: function () {
        if (!$(this).prop('disabled')) {
            const parentId = $(this).parent().attr('id');
            const day = parentId[parentId.length - 1];
            const dayStr = scheduleArray[day - 1 + PAGE * 7];
            const schdl = scheduleElements[dayStr];
            const tSlot = $(this).text().trim();
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                const index = schdl.breakTimes.indexOf(tSlot);
                if (index > -1) schdl.breakTimes.splice(index, 1);
            } else {
                $(this).addClass('active');
                schdl.breakTimes.push(tSlot);
            }
        }
    }
}, ".slot");

$('#saveSchedules').on('click', function (e) {
    e.preventDefault();
    const schedules = scheduleArray.map(schdlName => {
        const schdl = scheduleElements[schdlName];
        const {
            allSlotTimes,
            slotElements,
            ...schdlDetails
        } = schdl;
        return schdlDetails;
    });
    $.post('/doctor/data', {
        schedules
    }, (response) => {
        console.log(response);
    });
});

$('#patDetailsBtn').on('click', function () {
    window.location.href = `/patient/${mainApptmnt._id}`;
});

$("img").on("error", function () {
    $(this).attr("src", "/public/img/doctor_male.jpeg");
});

$('#video_btn').on('click', function(e){
    e.preventDefault();
    window.location.href = `/video/${mainApptmnt._id}`;
});