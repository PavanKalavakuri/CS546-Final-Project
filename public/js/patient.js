const apptmnt_id = $('#id').val().trim();
let allApptmnts = []
let mainApptmnt = undefined;

let scheduleElements = {};
let scheduleArray = [];
let PAGE = 0;


const initializeAppointments = (apptmnts) => {
    allApptmnts = []
    mainApptmnt = undefined;
    apptmnts.forEach(apptmnt => {
        allApptmnts.push(apptmnt);
    });
    allApptmnts.sort((apptmnt1, apptmnt2) => {
        return moment(apptmnt1.time) < moment(apptmnt2.time) ? 1 : -1;
    });
    mainApptmnt = allApptmnts[0];
};

const addApptmntListener = (a) => {
    a.on('click', function (e) {
        e.preventDefault();
        const elementId = $(this).attr('id');
        const index = parseInt(elementId.split('_')[1]);
        mainApptmnt = allApptmnts[index];
        updateApptmntSection();
    });
};

const createAppointmentElements = (parent, apptmnts) => {
    parent.empty();
    if (apptmnts[0]) {
        $(`#no_apptmnt_h4`).hide();
    }
    apptmnts.forEach((apptmnt, index) => {
        const indexStr = index.toString().padStart(3, "0");
        const a = $('<a>').addClass("dropdown-item p-0").attr('id', `apptmnt_${indexStr}`);
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
    createAppointmentElements($("#all_apptmnts"), allApptmnts);
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
    $.get(`/patient/apptmnts/${apptmnt_id}`, ({
        patApptmnts
    }) => {
        console.log(patApptmnts);
        initializeAppointments(patApptmnts);
        createAppointments();
        updateApptmntSection();
        if (mainApptmnt) {
            loadSchedules();
        }
    });
};


const createRemainingSchedule = (count, curDate, schedules) => {
    while (count--) {
        const daySchedule = {
            day: curDate.format('DD'),
            month: curDate.format('MM'),
            year: curDate.format('Y'),
            dayOfWeek: curDate.format('ddd'),
            monthName: curDate.format('MMM'),
            available: false,
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
        if (!schdl.breakTimes.includes(tSlot) && !schdl.workTimes.includes(tSlot)) {
            const slotButton = $('<button>');
            slotButton.addClass('slot btn btn-outline-success btn-sm rounded-0 my-1');
            slotButton.text(tSlot);
            slotElements.push(slotButton);
        }
    });
    return slotElements;
};

const createScheduleElements = (schedules) => {
    scheduleElements = {};
    scheduleArray = [];
    PAGE = 0;
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
    $(`#labelSlotsDay${day}`).text(`${schdl.monthName} ${schdl.day} ${schdl.dayOfWeek}`);
    $('#labelCurApptmnt').text(mainApptmnt.time_string);
    $('#labelNewApptmnt').text("Not Selected");
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

$(document).on({
    click: function (e) {
        e.preventDefault();
        const parentId = $(this).parent().attr('id');
        const day = parentId[parentId.length - 1];
        const dayStr = scheduleArray[day - 1 + PAGE * 7];
        const schdl = scheduleElements[dayStr];
        const tSlot = $(this).text().trim();
        if ($(this).hasClass('active')) {
            delete mainApptmnt.bookApptmnt;
            $(this).removeClass('active');
            $('#labelNewApptmnt').text("Not Selected");
        } else {
            if (mainApptmnt.bookApptmnt) mainApptmnt.bookApptmnt.slotElement.removeClass('active');
            mainApptmnt.bookApptmnt = {
                slotElement: $(this),
                slotDateTime: moment(`${schdl.year}-${schdl.month}-${schdl.day} ${tSlot}`),
                slotDuration: schdl.sessionTime
            }
            $(this).addClass('active');
            $('#labelNewApptmnt').text(mainApptmnt.bookApptmnt.slotDateTime.format("MMMM Do, h:mm a"));
        }
    }
}, ".slot");

$('#bookingModal').on('hidden.bs.modal', function () {
    if (mainApptmnt.bookApptmnt) mainApptmnt.bookApptmnt.slotElement.removeClass('active');
    delete mainApptmnt.bookApptmnt;
    $('#labelNewApptmnt').text("Not Selected");
});

$('#bookApptmnt').on('click', function (e) {
    e.preventDefault();
    const {
        bookApptmnt
    } = mainApptmnt;
    const newAppointment = allApptmnts[0];

    const user_id = newAppointment.user_id;
    const doc_id = newAppointment.doctor_id;
    const firstname = newAppointment.patient_name.split(' ')[0];
    const lastname = newAppointment.patient_name.split(' ')[1];
    const age = newAppointment.patient_age;
    const phone = newAppointment.patient_phone;
    const someone_else = newAppointment.someone_else;
    const gender = newAppointment.patient_gender;
    const insurance = newAppointment.insurance;
    const reason = newAppointment.patient_reason;
    const new_patient = "no";
    const notes = "";
    const prescription = "";
    const duration = bookApptmnt.slotDuration;
    const timeSlot = JSON.parse(JSON.stringify(bookApptmnt.slotDateTime.toDate()));

    const bookingDetails = {
        user_id,
        doc_id,
        firstname,
        lastname,
        age,
        phone,
        someone_else,
        gender,
        insurance,
        reason,
        new_patient,
        notes,
        prescription,
        duration,
        timeSlot
    };

    $.post('/user/booking', {
        bookingDetails
    }, (response) => {
        console.log(response);
        loadAppointments();
        $('#bookingModal').modal('toggle');
    });
});

$(".addPresc").on("click", function (e) {
    e.preventDefault();
    const newAppointment = allApptmnts[0];
    const aptId = newAppointment._id;
    const presc = document.getElementById("prescText").value.trim();
    $.post('/user/booking/'+ aptId, {
        presc
    });
    window.location.href = `/patient/${mainApptmnt._id}`;
});

$("img").on("error", function () {
    $(this).attr("src", "/public/img/doctor_male.jpeg");
});