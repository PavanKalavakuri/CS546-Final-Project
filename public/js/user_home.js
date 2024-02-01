let newApptmnts = []
let pastApptmnts = []
let mainApptmnt = undefined;

let scheduleElements = {};
let scheduleArray = [];
let PAGE = 0;


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

const updateRescheduleSection = () => {
    const doc_id = mainApptmnt.doctor_id;
    $.get(`/doctor/data/${doc_id}`, ({
        schedules
    }) => {
        console.log(schedules);
        checkAndFillSchedules(schedules);
        createScheduleElements(schedules);
        displaySchedule(PAGE);
    });
};

const addApptmntListener = (a) => {
    a.on('click', function (e) {
        e.preventDefault();
        const elementId = $(this).attr('id');
        const type = elementId.split('_')[0];
        const index = parseInt(elementId.split('_')[2]);
        mainApptmnt = type === 'new' ? newApptmnts[index] : pastApptmnts[index];
        updateApptmntSection();
        if (type === 'new') {
            updateRescheduleSection();
        }
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
        const div2 = $("<div>").addClass("row");
        const div3_1 = $("<div>").addClass("col-3");
        const div3_2 = $("<div>").addClass("col");
        const img_url = `/public/img/${apptmnt.doctor_id}.png`;
        const img = $("<img>").addClass("img-thumbnail border-secondary").attr("src", img_url).attr('alt', "doctor");
        addImageBreakListener(img);
        const p1 = $("<p>").text(apptmnt.doctor_name);
        const p2 = $("<p>").addClass("small text-muted").text(apptmnt.doctor_specialty);
        const p3 = $("<p>").addClass("small mt-2").text(apptmnt.time_string);
        a.append(div1.append(div2.append(div3_1.append(img)).append(div3_2.append(p1).append(p2).append(p3))));
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
        $('#doc_img').attr('src', `/public/img/${mainApptmnt.doctor_id}.png`);
        $('#doc_name').text(mainApptmnt.doctor_name);
        $('#doc_spclty').text(mainApptmnt.doctor_specialty);
        $('#doc_addr').text(mainApptmnt.doctor_address);
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
        if (mainApptmnt && mainApptmnt.type === 'new') {
            updateRescheduleSection();
        }
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
    click: function () {
        const parentId = $(this).parent().attr('id');
        const day = parentId[parentId.length - 1];
        const dayStr = scheduleArray[day - 1 + PAGE * 7];
        const schdl = scheduleElements[dayStr];
        const tSlot = $(this).text().trim();
        if ($(this).hasClass('active')) {
            delete mainApptmnt.reschdldApptmnt;
            $(this).removeClass('active');
            $('#labelNewApptmnt').text("Not Selected");
        } else {
            if (mainApptmnt.reschdldApptmnt) mainApptmnt.reschdldApptmnt.slotElement.removeClass('active');
            mainApptmnt.reschdldApptmnt = {
                slotElement: $(this),
                slotDateTime: moment(`${schdl.year}-${schdl.month}-${schdl.day} ${tSlot}`)
            }
            $(this).addClass('active');
            $('#labelNewApptmnt').text(mainApptmnt.reschdldApptmnt.slotDateTime.format("MMMM Do, h:mm a"));
        }
    }
}, ".slot");

$('#rescheduleModal').on('hidden.bs.modal', function () {
    if (mainApptmnt.reschdldApptmnt) mainApptmnt.reschdldApptmnt.slotElement.removeClass('active');
    delete mainApptmnt.reschdldApptmnt;
    $('#labelNewApptmnt').text("Not Selected");
});

$('#cancelApptmnt').on('click', function (e) {
    e.preventDefault();
    const apptmntId = mainApptmnt._id;
    $.ajax({
        url: `/appointment/${apptmntId}`,
        type: 'DELETE',
        success: (data) => {
            console.log(data);
            loadAppointments();
            $('#cancelModal').modal('toggle');
        }
    });
});

$('#updateApptmnt').on('click', function (e) {
    e.preventDefault();
    const {
        _id,
        reschdldApptmnt,
        ...updatedApptmnt
    } = mainApptmnt;
    updatedApptmnt.new_time = JSON.parse(JSON.stringify(reschdldApptmnt.slotDateTime.toDate()));
    $.post(`/appointment/${_id}`, {
        updatedApptmnt
    }, ({
        updatedApptmnt
    }) => {
        loadAppointments();
        $('#rescheduleModal').modal('toggle');
    });
});

$(document).on({
    mouseenter: function () {
        if ($('#rateNum').text().length === 0) {
            const elementId = $(this).attr('id');
            const num = elementId[elementId.length - 1];
            for (let i = 1; i <= num; i++) {
                $(`#star${i}`).addClass('star');
            }
        }
    },
    mouseleave: function () {
        if ($('#rateNum').text().length === 0) {
            for (let i = 1; i <= 5; i++) {
                $(`#star${i}`).removeClass('star');
            }
        }
    },
    click: function () {
        const elementId = $(this).attr('id');
        const num = elementId[elementId.length - 1];
        for (let i = 1; i <= 5; i++) {
            if (i <= num) $(`#star${i}`).addClass('star');
            else $(`#star${i}`).removeClass('star');
        }
        $('#rateNum').text(num);
        mainApptmnt.rating = num;
    }
}, ".rate");

$('#reviewModal').on('hidden.bs.modal', function () {
    $('#rateNum').text('');
    for (let i = 1; i <= 5; i++) {
        $(`#star${i}`).removeClass('star');
    }
    $('#reviewText').val('');
    delete mainApptmnt.rating;
    delete mainApptmnt.review;
});

$('#submitReview').on('click', function (e) {
    e.preventDefault();
    if (mainApptmnt.rating) {
        mainApptmnt.review = $('#reviewText').val();
        const {
            _id,
            user_id,
            doctor_id,
            rating,
            review
        } = mainApptmnt;
        const reviewData = {
            apptmnt_id: _id,
            user_id,
            doctor_id,
            rating,
            review
        };
        $.post(`/review`, {
            reviewData
        }, (response) => {
            console.log(response);
            $('#reviewModal').modal('toggle');
        });
    }
});


$("img").on("error", function () {
    $(this).attr("src", "/public/img/doctor_male.jpeg");
});

// $(document).on('error', 'img', function () {
//     $(this).attr("src", "/public/img/doctor_male.jpeg");
// });

const addImageBreakListener = function (img) {
    $(img).on('error', function () {
        $(this).attr("src", "/public/img/doctor_male.jpeg");
    });
}

$('#video_btn').on('click', function (e) {
    e.preventDefault();
    window.location.href = `/video/${mainApptmnt._id}`;
});