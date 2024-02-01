const doc_id = $('#id').val().trim();
const user_id = $('#user_id').val().trim();
let timeSlot = $('#time').val().trim();
let scheduleElements = {};
let scheduleArray = [];
let PAGE = 0;
let selectApptmnt = undefined;

$('#availability').hide();
$('#form-error').hide();
$('#name-error').hide();
$('#age-error').hide();
$('#phone-error').hide();


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
    if (selectApptmnt) selectApptmnt.slotElement.removeClass('active');
    selectApptmnt = undefined;
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

const selectScheduleSection = () => {
    $.get(`/doctor/data/${doc_id}`, ({
        schedules
    }) => {
        console.log(schedules);
        checkAndFillSchedules(schedules);
        createScheduleElements(schedules);
        displaySchedule(PAGE);
    });
};

selectScheduleSection();

$('#edit').on('click', function (e) {
    e.preventDefault();
    $('#availability').toggle();
});

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
            selectApptmnt = undefined;
            $(this).removeClass('active');
            $('#labelNewApptmnt').text("Not Selected");
        } else {
            if (selectApptmnt) selectApptmnt.slotElement.removeClass('active');
            selectApptmnt = {
                slotElement: $(this),
                slotDateTime: moment(`${schdl.year}-${schdl.month}-${schdl.day} ${tSlot}`),
                slotDuration: schdl.sessionTime
            }
            $(this).addClass('active');
            $('#labelNewApptmnt').text(selectApptmnt.slotDateTime.format("MMMM Do, h:mm a"));
        }
    }
}, ".slot");

const isNameInvalid = (name) => {
    if (
      name === undefined ||
      name.trim().length === 0 ||
      !/^[a-z\s]+$/i.test(name.trim())
    ) {
      return true;
    }
    return false;
  };

$('#book_form').submit(function (e) {
    e.preventDefault();
    let firstname = undefined;
    let lastname = undefined;
    let age = undefined;
    let phone = undefined;
    if (isNameInvalid($('#firstname').val())) {
        $('#name-error').text('Name cannot be empty!');
        $('#name-error').show();
    } else firstname = $('#firstname').val().trim();
    if (isNameInvalid($('#lastname').val())) {
        $('#name-error').text('Name cannot be empty!');
        $('#name-error').show();
    } else lastname = $('#lastname').val().trim();
    if ($('#age').val() === undefined) {
        $('#age-error').text('Age cannot be empty!');
        $('#age-error').show();
    } else age = $('#age').val();
    if (!$('#phone').val().match(/\d/g) || $('#phone').val().match(/\d/g).length !== 10) {
        $('#phone-error').text('Phone number is invalid!');
        $('#phone-error').show();
    } else phone = $('#phone').val();
    if (!firstname || !lastname || !age || !phone) return;
    $('#name-error').hide();
    $('#age-error').hide();
    $('#phone-error').hide();

    const someone_else = $('#isElse').val();
    const gender = $('#gender').val();
    const insurance = $('#insurance').val();
    const reason = $('#reason').val();
    const new_patient = $('input[name="newPatient"]').val();
    const notes = $('#notesText').val();
    const duration = selectApptmnt ? selectApptmnt.slotDuration : 30;
    timeSlot = selectApptmnt ? JSON.parse(JSON.stringify(selectApptmnt.slotDateTime.toDate())) : timeSlot;

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
        duration,
        timeSlot
    };
    $.post('/user/booking', {
        bookingDetails
    }, (response) => {
        console.log(response);
        $('#info').text(`Successfully Booked Appointment for ${moment(timeSlot).format("MMMM Do, h:mm a")}`);
        $('#form').hide();
    });

});


$("img").on("error", function () {
    $(this).attr("src", "/public/img/doctor_male.jpeg");
});

$('img').attr("src", `/public/img/${doc_id}.png`);