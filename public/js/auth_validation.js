console.log('this is a validation file..');
if ($('#error').length === 0) {
    $("[id$='-error']").hide();
}

const isNameInvalid = (name) => {
    if (name === undefined || name.trim().length === 0 || !/^[a-z\s]+$/i.test(name.trim())) {
        $('#name-error').text('Name should only have letters and not be empty');
        $('#name-error').show();
        return true;
    }
    return false;
};

const isEmailInvalid = (email) => {
    // regex -> /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    // unicode regex -> /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    if (email === undefined ||
        !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.trim())) {
        $('#email-error').text('Email is invalid');
        $('#email-error').show();
        return true;
    }
    return false
};

const isPasswordInvalid = (password) => {
    if (password === undefined || typeof (password) !== 'string' || password.trim().length < 6 || !/^\S+$/.test(password)) {
        $('#pass-error').text('Password should be atleast 6 characters (no spaces)');
        $('#pass-error').show();
        return true;
    }
    return false;
};

const isSpecialtyInvalid = (specialty) => {
    if (specialty === undefined || specialty === 'Specialty') {
        $('#specialty-error').text('Please choose a specialty');
        $('#specialty-error').show();
        return true;
    }
    return false;
};

$('#signup-form').submit((e) => {
    $("[id$='-error']").hide();
    const data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);
    const firstnameError = data.firstname ? isNameInvalid(data.firstname) : false;
    const lastnameError = data.lastname ? isNameInvalid(data.lastname) : false;
    const emailError = data.email ? isEmailInvalid(data.email) : false;
    const passwordError = data.password ? isPasswordInvalid(data.password) : false;
    const specialtyError = data.specialty ? isSpecialtyInvalid(data.specialty) : false;
    if (firstnameError || lastnameError || emailError || passwordError || specialtyError) {
        console.log('Submit stopped!!');
        e.preventDefault();
    }
});