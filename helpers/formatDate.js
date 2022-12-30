
function sp(s) {
    s = s+'';
    if (s.length == 1) {
        s = '0'+s;
    }
    return s;
}

function sameYear(d1, d2) {
    return d1.getFullYear() === d2.getFullYear()
}

function sameMonth(d1, d2) {
    return d1.getMonth() === d2.getMonth()
}

function sameDate(d1, d2) {
    return d1.getDate() === d2.getDate()
}

function sameYmd(d1, d2) {
    return (sameYear(d1, d2) && sameMonth(d1, d2) && sameDate(d1, d2))
}

function monthShort(month) {
    return monthCaption.short(month - 1);
}

function dayShort(day) {
    return dayCaption.short(day);
}

function ymd(date) {
    return date.getFullYear()+'-'+sp(date.getMonth()+1)+'-'+sp(date.getDate());
}

function Mmy(date) {
    return monthCaption.short(date.getMonth())+' '+date.getFullYear();
}

function Mdy(date) {
    return monthCaption.full(date.getMonth())+' '+date.getDate()+', '+date.getFullYear();
}

function dmy(date) {
    return date.getDate()+' '+monthCaption.short(date.getMonth())+', '+date.getFullYear();
}

function h(date) {
    return sp(date.getHours())
}

function pih(date) {
    return parseInt(sp(date.getHours()), 10)
}

function hi(date) {
    return sp(date.getHours())+':'+sp(date.getMinutes())
}

function his(date) {
    return sp(date.getHours())+':'+sp(date.getMinutes())+':'+sp(date.getSeconds());
}

function ymdhis(date) {
    return ymd(date)+' '+his(date);
}

function ymdhi(date) {
    return ymd(date)+' '+hi(date);
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function daysInMonthByDate(date) {
    return daysInMonth(date.getFullYear(), date.getMonth()+1);
}

function dayOfYear(date) {
    let year = date.getFullYear();
    let month = date.getMonth()+1;

    let r = 0;
    for (let m = 1; m < month; m++) {
        r += daysInMonth(year, m);
    }
    return r + date.getDate();
}

/**
 * perioda formatēšana šādā veidā
 * 10 - 20 okt, 2019
 * 10 okt - 20 dec, 2019
 * 10 okt, 2019 - 20 jan, 2020
 */
function datePeriodHR(from, till) {
    if (!(from && till)) {
        return '';
    }

    let sy = sameYear(from, till);
    let sm = sameMonth(from, till);
    let sd = sameDate(from, till);

    if (sy && sm && sd) {
        return till.getDate()+' '+monthCaption.short(till.getMonth())+', '+till.getFullYear();
    }
    else if (sy && sm) {
        return from.getDate()+' - '+till.getDate()+' '+monthCaption.short(till.getMonth())+', '+till.getFullYear();
    }
    else if (sy) {
        return from.getDate()+' '+monthCaption.short(from.getMonth())+' - '+till.getDate()+' '+monthCaption.short(till.getMonth())+', '+till.getFullYear();
    }
    else {
        return from.getDate()+' '+monthCaption.short(from.getMonth())+', '+from.getFullYear()+' - '+till.getDate()+' '+monthCaption.short(till.getMonth())+', '+till.getFullYear();
    }
}

function timePeriodHR(from, till, baseDate) {
    if (!(from && till)) {
        return '';
    }

    let fsy = sameYear(from, baseDate);
    let fsm = sameMonth(from, baseDate);
    let fsd = sameDate(from, baseDate);

    let tsy = sameYear(till, baseDate);
    let tsm = sameMonth(till, baseDate);
    let tsd = sameDate(till, baseDate);



    let stringFrom = '';
    let stringTill = '';

    if (fsy && fsm && fsd) {
        stringFrom = hi(from);
    }
    else if (fsy && fsm) {
        stringFrom = hi(from)+', '+from.getDate()+' '+monthCaption.short(from.getMonth());
    }
    else if (fsy) {
        stringFrom = hi(from)+', '+from.getDate()+' '+monthCaption.short(from.getMonth());
    }
    else {
        stringFrom = hi(from)+', '+from.getDate()+' '+monthCaption.short(from.getMonth())+', '+from.getFullYear();
    }



    if (tsy && tsm && tsd) {
        stringTill = hi(till);
    }
    else if (tsy && tsm) {
        stringTill = hi(till)+', '+till.getDate()+' '+monthCaption.short(till.getMonth());
    }
    else if (tsy) {
        stringTill = hi(till)+', '+till.getDate()+' '+monthCaption.short(till.getMonth());
    }
    else {
        stringTill = hi(till)+', '+till.getDate()+' '+monthCaption.short(till.getMonth())+', '+till.getFullYear();
    }

    return stringFrom+' - '+stringTill
}

function timeToMinutes(time) {
    time = time.split(':');

    return (parseInt(time[0], 10)*60) + parseInt(time[1], 10);
}

/**
 * Diff in ms transalted to minutes:seconds
 */
function diffToMinutes(diff) {

    // seconds
    diff = diff / 1000;


    let minutes = Math.floor(diff/60);
    let seconds = Math.floor(diff - minutes*60);

    return sp(minutes)+':'+sp(seconds);
}

module.exports = {
    sp: sp,
    Mmy: Mmy,
    ymd: ymd,
    Mdy: Mdy,
    dmy: dmy,
    h: h,
    pih: pih,
    hi: hi,
    his: his,
    ymdhis: ymdhis,
    ymdhi: ymdhi,
    dayShort: dayShort,
    daysInMonth: daysInMonth,
    daysInMonthByDate: daysInMonthByDate,
    dayOfYear: dayOfYear,
    monthShort: monthShort,
    datePeriodHR: datePeriodHR,
    timePeriodHR: timePeriodHR,
    sameYmd: sameYmd,
    timeToMinutes: timeToMinutes,
    diffToMinutes: diffToMinutes
}