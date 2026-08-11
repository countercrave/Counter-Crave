"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ClientCalculator() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dob, setDob] = useState("");
  const [refDate, setRefDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const [daysOut, setDaysOut] = useState("—");
  const [daysLabel, setDaysLabel] = useState("days");
  const [orbitDays, setOrbitDays] = useState("—");
  const [orbitLabel, setOrbitLabel] = useState("days left");
  const [nextDateOut, setNextDateOut] = useState("—");
  const [weekdayOut, setWeekdayOut] = useState("—");
  const [turningOut, setTurningOut] = useState("—");
  const [weeksOut, setWeeksOut] = useState("—");
  const [calendarOut, setCalendarOut] = useState("—");
  const [sinceLastOut, setSinceLastOut] = useState("—");
  const [statusTitle, setStatusTitle] = useState("Your birthday countdown will appear here.");
  const [statusText, setStatusText] = useState("Enter your date of birth and calculate from today or another date.");
  const [resultFoot, setResultFoot] = useState("Your birthday date, turning age and timing details will appear after calculation.");
  const [copyData, setCopyData] = useState("");
  const [copyBtnText, setCopyBtnText] = useState("Copy");
  const [dashOffset, setDashOffset] = useState("314.159");

  const resultRef = useRef<HTMLDivElement>(null);

  const pad = (n: number) => String(n).padStart(2, '0');
  const MS_DAY = 86400000;

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  useEffect(() => {
    setRefDate(todayISO());
  }, []);

  const parseISO = (v: string) => {
    const [y, m, d] = v.split('-').map(Number);
    return { y, m, d };
  };

  const toUTC = (o: { y: number; m: number; d: number }) => new Date(Date.UTC(o.y, o.m - 1, o.d));
  const dim = (y: number, m: number) => new Date(y, m, 0).getDate();
  const cmp = (a: { y: number; m: number; d: number }, b: { y: number; m: number; d: number }) =>
    a.y !== b.y ? a.y - b.y : a.m !== b.m ? a.m - b.m : a.d - b.d;
  const leap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const daysBetween = (a: any, b: any) => Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / MS_DAY);

  const fmt = (o: any) =>
    new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(toUTC(o));
  const weekday = (o: any) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(toUTC(o));

  const anniversary = (dobObj: any, year: number) => {
    let d = dobObj.d;
    if (dobObj.m === 2 && dobObj.d === 29 && !leap(year)) d = 28;
    return { y: year, m: dobObj.m, d };
  };

  const nextBirthday = (dobObj: any, refObj: any) => {
    let target = anniversary(dobObj, refObj.y);
    if (cmp(target, refObj) < 0) target = anniversary(dobObj, refObj.y + 1);
    return target;
  };

  const previousBirthday = (dobObj: any, refObj: any) => {
    let prev = anniversary(dobObj, refObj.y);
    if (cmp(prev, refObj) > 0) prev = anniversary(dobObj, refObj.y - 1);
    return prev;
  };

  const calendarDiff = (start: any, end: any) => {
    let months = (end.y - start.y) * 12 + (end.m - start.m);
    const shifted = (base: any, n: number) => {
      const idx = base.m - 1 + n;
      const y = base.y + Math.floor(idx / 12);
      const m = ((idx % 12) + 12) % 12 + 1;
      return { y, m, d: Math.min(base.d, dim(y, m)) };
    };
    if (cmp(shifted(start, months), end) > 0) months--;
    const anchor = shifted(start, months);
    const days = daysBetween(anchor, end);
    return { months, days };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!dob || !refDate) {
      setErrorMsg("Please enter both the date of birth and countdown reference date.");
      return;
    }

    const dobObj = parseISO(dob);
    const refObj = parseISO(refDate);

    if (cmp(dobObj, refObj) > 0) {
      setErrorMsg("The countdown reference date cannot be earlier than the date of birth.");
      return;
    }

    const next = nextBirthday(dobObj, refObj);
    const prev = previousBirthday(dobObj, refObj);
    const daysLeftVal = Math.max(0, daysBetween(refObj, next));
    const daysSinceVal = Math.max(0, daysBetween(prev, refObj));
    const birthdayYearLength = Math.max(1, daysBetween(prev, next));
    const turningVal = next.y - dobObj.y;
    const wholeWeeks = Math.floor(daysLeftVal / 7);
    const extraDays = daysLeftVal % 7;
    const cal = calendarDiff(refObj, next);
    const progress = Math.min(1, Math.max(0, daysSinceVal / birthdayYearLength));

    setDaysOut(daysLeftVal.toLocaleString());
    setDaysLabel(daysLeftVal === 1 ? 'day' : 'days');
    setOrbitDays(daysLeftVal.toLocaleString());
    setOrbitLabel(daysLeftVal === 0 ? 'birthday today' : daysLeftVal === 1 ? 'day left' : 'days left');
    setNextDateOut(fmt(next));
    setWeekdayOut(weekday(next));
    setTurningOut(daysLeftVal === 0 ? `${turningVal} today` : `${turningVal}`);
    setWeeksOut(`${wholeWeeks.toLocaleString()} wk + ${extraDays} d`);
    setCalendarOut(cal.months ? `${cal.months} mo + ${cal.days} d` : `${cal.days} days`);
    setSinceLastOut(daysSinceVal.toLocaleString());

    const circumference = 314.159;
    setDashOffset(String(circumference * (1 - progress)));

    if (daysLeftVal === 0) {
      setStatusTitle('Happy birthday — the countdown is complete!');
      setStatusText(`Your birthday is ${fmt(next)} (${weekday(next)}). You turn ${turningVal} today.`);
    } else if (daysLeftVal === 1) {
      setStatusTitle('Your birthday is tomorrow.');
      setStatusText(`You will turn ${turningVal} on ${fmt(next)}, a ${weekday(next)}.`);
    } else {
      setStatusTitle(`${daysLeftVal.toLocaleString()} days until your next birthday.`);
      setStatusText(`You will turn ${turningVal} on ${fmt(next)}, which falls on a ${weekday(next)}.`);
    }

    setResultFoot(`Reference date: ${fmt(refObj)} · Last birthday: ${fmt(prev)} · Next birthday: ${fmt(next)}`);
    setCopyData(`Birthday countdown from ${fmt(refObj)}: ${daysLeftVal} days until ${fmt(next)} (${weekday(next)}). Turning age: ${turningVal}. Whole weeks: ${wholeWeeks} + ${extraDays} days. Days since last birthday: ${daysSinceVal}.`);

    setHasResult(true);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleReset = () => {
    setDob("");
    setRefDate(todayISO());
    setErrorMsg("");
    setHasResult(false);
  };

  const handleCopy = async () => {
    if (!copyData) return;
    try {
      await navigator.clipboard.writeText(copyData);
      setCopyBtnText("Copied");
      setTimeout(() => setCopyBtnText("Copy"), 1400);
    } catch {
      setCopyBtnText("Copy unavailable");
    }
  };

  return (
    <div className="birthday-calculator-standalone-root">
      <style jsx global>{`
        :root {
          --ink: #121a35; --ink-2: #263252; --muted: #68718a; --brand: #5b57e8; --brand-2: #706cf0; --brand-soft: #efefff;
          --teal: #0f9f8e; --teal-soft: #e9fbf8; --gold: #d99100; --gold-soft: #fff7df; --rose: #d75b7a; --rose-soft: #fff0f4;
          --bg: #f7f8fc; --card: #fff; --line: #e3e6f0; --line-2: #d8dcef; --shadow: 0 18px 55px rgba(29,38,70,.09);
          --max: 1180px; --radius: 22px; --radius-sm: 14px;
        }
        .birthday-calculator-standalone-root {
          background: var(--bg);
          color: var(--ink);
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          line-height: 1.65;
          margin: 0;
          padding: 0;
        }
        .birthday-calculator-standalone-root .container { width: min(var(--max), calc(100% - 40px)); margin: auto; }
        .birthday-calculator-standalone-root .muted { color: var(--muted); }
        .birthday-calculator-standalone-root .eyebrow { color: var(--brand); font-size: .76rem; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; }
        .birthday-calculator-standalone-root .kicker { display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px; border: 1px solid #d8d8ff; background: #f5f4ff; border-radius: 999px; color: var(--brand); font-size: .78rem; font-weight: 850; }
        .birthday-calculator-standalone-root .btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 48px; padding: 12px 18px; border-radius: 13px; border: 1px solid transparent; font-weight: 850; cursor: pointer; transition: .2s ease; }
        .birthday-calculator-standalone-root .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 12px 28px rgba(91,87,232,.22); }
        .birthday-calculator-standalone-root .btn-primary:hover { background: #504cdb; transform: translateY(-1px); }
        .birthday-calculator-standalone-root .btn-secondary { background: #fff; border-color: var(--line); color: var(--ink-2); }
        .birthday-calculator-standalone-root .btn-secondary:hover { border-color: #bebcf8; color: var(--brand); }
        .birthday-calculator-standalone-root .text-link { display: inline-flex; align-items: center; gap: 6px; color: var(--brand); font-weight: 850; }
        .birthday-calculator-standalone-root .text-link:hover { text-decoration: underline; }

        .birthday-calculator-standalone-root .site-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.93); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(225,228,239,.88); }
        .birthday-calculator-standalone-root .nav { height: 74px; display: flex; align-items: center; gap: 28px; }
        .birthday-calculator-standalone-root .brand { display: flex; align-items: center; gap: 11px; font-weight: 900; letter-spacing: -.02em; white-space: nowrap; }
        .birthday-calculator-standalone-root .brand-mark { width: 40px; height: 40px; border-radius: 13px; background: linear-gradient(145deg,var(--brand),#8a67ee); display: grid; place-items: center; color: #fff; box-shadow: 0 9px 22px rgba(91,87,232,.26); }
        .birthday-calculator-standalone-root .brand-mark svg { width: 22px; }
        .birthday-calculator-standalone-root .nav-links { display: flex; gap: 24px; margin-left: auto; }
        .birthday-calculator-standalone-root .nav-links a { font-size: .91rem; font-weight: 750; color: #4f5872; }
        .birthday-calculator-standalone-root .nav-links a:hover { color: var(--brand); }
        .birthday-calculator-standalone-root .nav-actions { display: flex; align-items: center; gap: 9px; }
        .birthday-calculator-standalone-root .nav-pill { display: inline-flex; align-items: center; min-height: 40px; padding: 8px 13px; border-radius: 11px; border: 1px solid var(--line); background: #fff; font-size: .84rem; font-weight: 800; color: var(--ink-2); }
        .birthday-calculator-standalone-root .menu-btn { display: none; border: 1px solid var(--line); background: #fff; width: 42px; height: 42px; border-radius: 11px; place-items: center; cursor: pointer; }
        .birthday-calculator-standalone-root .mobile-nav { background: #fff; border-bottom: 1px solid var(--line); padding: 8px 20px 18px; }
        .birthday-calculator-standalone-root .mobile-nav a { display: block; padding: 11px 0; color: var(--ink-2); font-weight: 750; }

        .birthday-calculator-standalone-root .breadcrumb { padding: 20px 0 0; font-size: .82rem; color: var(--muted); }
        .birthday-calculator-standalone-root .breadcrumb ol { list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; flex-wrap: wrap; }
        .birthday-calculator-standalone-root .breadcrumb li+li:before { content: "/"; margin-right: 8px; color: #abb2c5; }
        .birthday-calculator-standalone-root .breadcrumb a:hover { color: var(--brand); }

        .birthday-calculator-standalone-root .hero { padding: 46px 0 46px; background: radial-gradient(circle at 84% 18%,rgba(91,87,232,.12),transparent 32%),radial-gradient(circle at 10% 70%,rgba(15,159,142,.09),transparent 28%),linear-gradient(180deg,#fff 0%,#f8f9fd 100%); border-bottom: 1px solid var(--line); }
        .birthday-calculator-standalone-root .hero-grid { display: grid; grid-template-columns: minmax(0,.86fr) minmax(460px,1.14fr); gap: 54px; align-items: start; }
        .birthday-calculator-standalone-root .hero-copy { padding-top: 23px; }
        .birthday-calculator-standalone-root .hero h1 { font-size: clamp(2.6rem,5vw,4.45rem); line-height: .99; letter-spacing: -.055em; margin: 15px 0 18px; max-width: 720px; }
        .birthday-calculator-standalone-root .hero .lead { font-size: 1.08rem; line-height: 1.75; color: var(--muted); max-width: 690px; margin: 0 0 23px; }
        .birthday-calculator-standalone-root .trust-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 23px 0; }
        .birthday-calculator-standalone-root .trust-chip { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 8px 11px; color: var(--ink-2); font-weight: 760; font-size: .82rem; }
        .birthday-calculator-standalone-root .trust-chip .tick { color: var(--teal); font-weight: 900; }
        .birthday-calculator-standalone-root .hero-meta { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 18px; color: var(--muted); font-size: .82rem; }
        .birthday-calculator-standalone-root .hero-meta strong { color: var(--ink-2); }
        .birthday-calculator-standalone-root .hero-visual { margin-top: 28px; border: 1px solid var(--line); border-radius: 20px; background: rgba(255,255,255,.72); padding: 15px; max-width: 580px; overflow: hidden; }
        .birthday-calculator-standalone-root .hero-visual img { display: block; width: 100%; height: auto; border-radius: 12px; }

        .birthday-calculator-standalone-root .calc-card { background: #fff; border: 1px solid var(--line); border-radius: 27px; box-shadow: var(--shadow); overflow: hidden; }
        .birthday-calculator-standalone-root .calc-head { padding: 22px 24px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; gap: 18px; align-items: center; }
        .birthday-calculator-standalone-root .calc-head-left { display: flex; align-items: center; gap: 12px; }
        .birthday-calculator-standalone-root .calc-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--brand-soft); color: var(--brand); display: grid; place-items: center; font-size: 1.4rem; }
        .birthday-calculator-standalone-root .calc-head strong { display: block; }
        .birthday-calculator-standalone-root .calc-head small { display: block; color: var(--muted); margin-top: 2px; }
        .birthday-calculator-standalone-root .private-pill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 999px; background: var(--teal-soft); color: #087a6d; font-size: .73rem; font-weight: 900; white-space: nowrap; }
        .birthday-calculator-standalone-root .calc-body { padding: 24px; }
        .birthday-calculator-standalone-root .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .birthday-calculator-standalone-root .field label { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 7px; font-size: .84rem; font-weight: 850; color: var(--ink-2); }
        .birthday-calculator-standalone-root .field label span { font-weight: 650; color: var(--muted); }
        .birthday-calculator-standalone-root input[type=date] { width: 100%; height: 52px; border: 1px solid #d9deea; border-radius: 13px; padding: 0 13px; color: var(--ink); background: #fafbfe; outline: 0; transition: .18s ease; }
        .birthday-calculator-standalone-root input[type=date]:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 4px rgba(91,87,232,.10); }
        .birthday-calculator-standalone-root .quick-date { display: flex; gap: 8px; margin-top: 9px; }
        .birthday-calculator-standalone-root .quick-date button { border: 1px solid var(--line); background: #fff; border-radius: 9px; padding: 6px 9px; font-size: .73rem; font-weight: 800; color: var(--muted); cursor: pointer; }
        .birthday-calculator-standalone-root .quick-date button:hover { border-color: #c5c2ff; color: var(--brand); }
        .birthday-calculator-standalone-root .calc-actions { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 18px; }
        .birthday-calculator-standalone-root .calc-actions .btn { width: 100%; }
        .birthday-calculator-standalone-root .calc-note { font-size: .76rem; color: var(--muted); text-align: center; margin: 12px 0 0; }
        .birthday-calculator-standalone-root .error { display: none; margin-top: 14px; padding: 11px 13px; border-radius: 11px; background: #fff0f2; border: 1px solid #f2cbd4; color: #9d3850; font-size: .84rem; font-weight: 700; }
        .birthday-calculator-standalone-root .error.show { display: block; }
        .birthday-calculator-standalone-root .result { display: none; margin-top: 22px; border-radius: 21px; background: linear-gradient(145deg,#f5f4ff,#fbfbff); border: 1px solid #dbdcf8; overflow: hidden; }
        .birthday-calculator-standalone-root .result.show { display: block; }
        .birthday-calculator-standalone-root .result-top { padding: 22px 22px 17px; border-bottom: 1px solid #dedff4; display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; }
        .birthday-calculator-standalone-root .result-label { font-size: .75rem; text-transform: uppercase; letter-spacing: .11em; font-weight: 900; color: var(--brand); }
        .birthday-calculator-standalone-root .age-line { margin-top: 5px; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
        .birthday-calculator-standalone-root .age-line .years { font-size: 3.2rem; font-weight: 950; line-height: 1; color: var(--brand); letter-spacing: -.06em; }
        .birthday-calculator-standalone-root .age-line .rest { font-size: 1rem; font-weight: 850; color: var(--ink-2); }
        .birthday-calculator-standalone-root .result-tools { display: flex; gap: 7px; }
        .birthday-calculator-standalone-root .mini-btn { border: 1px solid #d6d8ee; background: #fff; color: var(--ink-2); border-radius: 9px; padding: 7px 10px; font-size: .75rem; font-weight: 850; cursor: pointer; }
        .birthday-calculator-standalone-root .mini-btn:hover { color: var(--brand); border-color: #bab8f8; }
        .birthday-calculator-standalone-root .result-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; }
        .birthday-calculator-standalone-root .metric { padding: 16px 17px; border-right: 1px solid #dedff4; border-bottom: 1px solid #dedff4; }
        .birthday-calculator-standalone-root .metric:nth-child(3n) { border-right: 0; }
        .birthday-calculator-standalone-root .metric:nth-last-child(-n+3) { border-bottom: 0; }
        .birthday-calculator-standalone-root .metric b { display: block; font-size: 1.08rem; color: var(--ink); line-height: 1.3; }
        .birthday-calculator-standalone-root .metric small { display: block; color: var(--muted); margin-top: 3px; font-size: .72rem; }
        .birthday-calculator-standalone-root .result-foot { padding: 13px 18px; background: #fff; color: var(--muted); font-size: .76rem; }

        .birthday-calculator-standalone-root .ad-wrap { margin: 28px auto; }
        .birthday-calculator-standalone-root .ad-label { text-align: center; font-size: .66rem; letter-spacing: .11em; text-transform: uppercase; color: #98a0b5; margin-bottom: 7px; }
        .birthday-calculator-standalone-root .ad-box { min-height: 112px; border: 1px dashed #d7dbe8; border-radius: 13px; background: #f9fafc; display: grid; place-items: center; color: #a1a8b9; font-size: .76rem; }

        .birthday-calculator-standalone-root .section { padding: 78px 0; }
        .birthday-calculator-standalone-root .section.soft { background: #fff; }
        .birthday-calculator-standalone-root .section.tint { background: linear-gradient(180deg,#f0f0ff 0%,#f7f7ff 100%); border-block: 1px solid #e1e1fa; }
        .birthday-calculator-standalone-root .section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-bottom: 29px; }
        .birthday-calculator-standalone-root .section-head .copy { max-width: 790px; }
        .birthday-calculator-standalone-root .section h2 { font-size: clamp(1.9rem,4vw,2.7rem); line-height: 1.08; letter-spacing: -.035em; margin: 8px 0 11px; }
        .birthday-calculator-standalone-root .section-head p, .birthday-calculator-standalone-root .prose p { color: var(--muted); font-size: 1rem; line-height: 1.78; }
        .birthday-calculator-standalone-root .section-head p { margin: 0; }
        .birthday-calculator-standalone-root .prose p { margin: 0 0 17px; }
        .birthday-calculator-standalone-root .prose h3 { font-size: 1.25rem; line-height: 1.3; margin: 26px 0 10px; }
        .birthday-calculator-standalone-root .prose a { color: var(--brand); font-weight: 800; }
        .birthday-calculator-standalone-root .prose a:hover { text-decoration: underline; }
        .birthday-calculator-standalone-root .toc { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .birthday-calculator-standalone-root .toc a { padding: 7px 10px; border: 1px solid var(--line); border-radius: 999px; background: #fff; font-size: .78rem; font-weight: 800; color: var(--ink-2); }
        .birthday-calculator-standalone-root .toc a:hover { border-color: #bdbbfa; color: var(--brand); }
        .birthday-calculator-standalone-root .feature-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 15px; }
        .birthday-calculator-standalone-root .feature-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 21px; }
        .birthday-calculator-standalone-root .feature-icon { width: 42px; height: 42px; border-radius: 12px; background: var(--brand-soft); display: grid; place-items: center; margin-bottom: 14px; color: var(--brand); font-size: 1.2rem; }
        .birthday-calculator-standalone-root .feature-card h3 { font-size: 1.02rem; margin: 0 0 6px; }
        .birthday-calculator-standalone-root .feature-card p { font-size: .88rem; line-height: 1.6; color: var(--muted); margin: 0; }
        .birthday-calculator-standalone-root .content-grid { display: grid; grid-template-columns: minmax(0,1.36fr) minmax(280px,.64fr); gap: 36px; align-items: start; }
        .birthday-calculator-standalone-root .content-grid.equal { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .birthday-calculator-standalone-root .content-card { background: #fff; border: 1px solid var(--line); border-radius: 21px; padding: 24px; box-shadow: 0 12px 35px rgba(30,40,75,.05); }
        .birthday-calculator-standalone-root .content-card h3 { margin-top: 0; }
        .birthday-calculator-standalone-root .sticky-card { position: sticky; top: 100px; }
        .birthday-calculator-standalone-root .step-list { counter-reset: step; display: grid; gap: 12px; margin: 22px 0; }
        .birthday-calculator-standalone-root .step { counter-increment: step; display: grid; grid-template-columns: 43px 1fr; gap: 14px; padding: 16px; border: 1px solid var(--line); background: #fff; border-radius: 16px; }
        .birthday-calculator-standalone-root .step:before { content: counter(step); width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; background: var(--brand-soft); color: var(--brand); font-weight: 950; }
        .birthday-calculator-standalone-root .step b { display: block; color: var(--ink); margin: 1px 0 4px; }
        .birthday-calculator-standalone-root .step p { margin: 0; font-size: .92rem; }
        .birthday-calculator-standalone-root .callout { padding: 20px 21px; border-radius: 17px; background: var(--teal-soft); border: 1px solid #c6eee7; margin: 22px 0; }
        .birthday-calculator-standalone-root .callout.warn { background: var(--gold-soft); border-color: #f1dfad; }
        .birthday-calculator-standalone-root .callout.rose { background: var(--rose-soft); border-color: #f2d1db; }
        .birthday-calculator-standalone-root .callout strong { color: var(--ink); }
        .birthday-calculator-standalone-root .callout p { margin: 5px 0 0; font-size: .94rem; }
        .birthday-calculator-standalone-root .formula { background: #111a3a; color: #fff; border-radius: 15px; padding: 17px 18px; font-family: ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size: .88rem; line-height: 1.7; overflow: auto; margin: 20px 0; }
        .birthday-calculator-standalone-root .example-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 15px; }
        .birthday-calculator-standalone-root .example-card { border: 1px solid var(--line); border-radius: 18px; background: #fff; padding: 20px; }
        .birthday-calculator-standalone-root .example-card h3 { font-size: 1rem; margin: 7px 0; }
        .birthday-calculator-standalone-root .example-card p { font-size: .88rem; line-height: 1.65; color: var(--muted); margin: 0; }
        .birthday-calculator-standalone-root .related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 15px; }
        .birthday-calculator-standalone-root .related-card { display: block; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px; transition: .18s; }
        .birthday-calculator-standalone-root .related-card:hover { transform: translateY(-2px); border-color: #c4c2fb; box-shadow: 0 12px 27px rgba(91,87,232,.08); }
        .birthday-calculator-standalone-root .related-icon { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 11px; background: var(--brand-soft); font-size: 1rem; margin-bottom: 13px; }
        .birthday-calculator-standalone-root .related-card strong { display: block; font-size: .98rem; }
        .birthday-calculator-standalone-root .related-card span { display: block; color: var(--muted); font-size: .83rem; line-height: 1.55; margin-top: 5px; }
        .birthday-calculator-standalone-root .guide-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .birthday-calculator-standalone-root .guide-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
        .birthday-calculator-standalone-root .guide-copy { padding: 18px; }
        .birthday-calculator-standalone-root .guide-copy h3 { font-size: 1rem; margin: 6px 0; }
        .birthday-calculator-standalone-root .guide-copy p { font-size: .84rem; color: var(--muted); line-height: 1.55; margin: 0; }
        .birthday-calculator-standalone-root .author-card { display: grid; grid-template-columns: 84px 1fr; gap: 20px; align-items: center; border: 1px solid var(--line); border-radius: 20px; background: #fff; padding: 22px; }
        .birthday-calculator-standalone-root .author-avatar { width: 74px; height: 74px; border-radius: 50%; background: linear-gradient(135deg,#5b57e8,#14b8a6); display: grid; place-items: center; color: #fff; font-weight: 950; font-size: 1.35rem; border: 5px solid #f2f3ff; }
        .birthday-calculator-standalone-root .author-meta { text-align: left; color: var(--muted); font-size: .77rem; margin-top: 10px; }
        .birthday-calculator-standalone-root .author-meta a { display: inline-block; color: var(--brand); font-weight: 850; margin-right: 12px; }
        .birthday-calculator-standalone-root .faq-grid { display: grid; grid-template-columns: .56fr 1.44fr; gap: 40px; align-items: start; }
        .birthday-calculator-standalone-root .faq-intro { position: sticky; top: 102px; }
        .birthday-calculator-standalone-root .faq-list details { border-bottom: 1px solid var(--line); background: #fff; }
        .birthday-calculator-standalone-root .faq-list details:first-child { border-top: 1px solid var(--line); }
        .birthday-calculator-standalone-root .faq-list summary { list-style: none; cursor: pointer; padding: 18px 38px 18px 0; font-weight: 850; color: var(--ink); position: relative; }
        .birthday-calculator-standalone-root .faq-list summary::-webkit-details-marker { display: none; }
        .birthday-calculator-standalone-root .faq-list summary:after { content: "+"; position: absolute; right: 5px; top: 13px; color: var(--brand); font-size: 1.5rem; font-weight: 500; }
        .birthday-calculator-standalone-root .faq-list details[open] summary:after { content: "−"; }
        .birthday-calculator-standalone-root .faq-list details p { margin: 0; padding: 0 42px 18px 0; color: var(--muted); font-size: .91rem; line-height: 1.7; }
        .birthday-calculator-standalone-root .cta { border-radius: 25px; background: linear-gradient(135deg,#111a3a,#242a5d); padding: 44px; color: #fff; display: flex; justify-content: space-between; gap: 35px; align-items: center; position: relative; overflow: hidden; }
        .birthday-calculator-standalone-root .cta-copy { position: relative; z-index: 2; max-width: 650px; }
        .birthday-calculator-standalone-root .cta h2 { color: #fff; margin: 0 0 8px; }
        .birthday-calculator-standalone-root .cta p { color: #bec8df; margin: 0; }
        .birthday-calculator-standalone-root .cta-actions { position: relative; z-index: 2; display: flex; gap: 10px; flex-wrap: wrap; }
        .birthday-calculator-standalone-root footer { background: #10162d; color: #edf0fa; padding: 58px 0 26px; margin-top: 80px; }
        .birthday-calculator-standalone-root .footer-grid { display: grid; grid-template-columns: 1.35fr repeat(3,1fr); gap: 40px; }
        .birthday-calculator-standalone-root .footer-brand p { color: #aeb8d1; max-width: 360px; font-size: .88rem; }
        .birthday-calculator-standalone-root .footer-col h3 { font-size: .86rem; margin: 0 0 12px; }
        .birthday-calculator-standalone-root .footer-col a { display: block; color: #aeb8d1; font-size: .83rem; margin: 8px 0; }
        .birthday-calculator-standalone-root .footer-col a:hover { color: #fff; }
        .birthday-calculator-standalone-root .footer-bottom { border-top: 1px solid rgba(255,255,255,.08); margin-top: 32px; padding-top: 20px; display: flex; justify-content: space-between; gap: 20px; color: #8f99b4; font-size: .75rem; }

        .birthday-calculator-standalone-root .countdown-orbit { position: relative; width: 190px; height: 190px; margin: 6px auto 10px; display: grid; place-items: center; }
        .birthday-calculator-standalone-root .countdown-orbit svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
        .birthday-calculator-standalone-root .countdown-orbit .track { fill: none; stroke: #eceefa; stroke-width: 12; }
        .birthday-calculator-standalone-root .countdown-orbit .progress { fill: none; stroke: var(--brand); stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset .5s ease; }
        .birthday-calculator-standalone-root .countdown-center { text-align: center; position: relative; z-index: 1; }
        .birthday-calculator-standalone-root .countdown-center b { display: block; font-size: 2.7rem; line-height: 1; color: var(--ink); letter-spacing: -.05em; }
        .birthday-calculator-standalone-root .countdown-center span { display: block; margin-top: 6px; color: var(--muted); font-size: .86rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
        .birthday-calculator-standalone-root .birthday-banner { display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: center; background: linear-gradient(135deg,#f5f4ff,#fff8e6); border: 1px solid #dedcff; border-radius: 18px; padding: 18px; margin-top: 18px; }
        .birthday-calculator-standalone-root .birthday-banner .emoji { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 16px; background: #fff; font-size: 1.7rem; box-shadow: 0 8px 20px rgba(29,38,70,.07); }
        .birthday-calculator-standalone-root .birthday-banner b { display: block; color: var(--ink); }
        .birthday-calculator-standalone-root .birthday-banner span { display: block; color: var(--muted); font-size: .92rem; margin-top: 3px; }
        .birthday-calculator-standalone-root .timeline-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 22px; margin-top: 22px; }
        .birthday-calculator-standalone-root .timeline-line { position: relative; height: 8px; border-radius: 999px; background: #e9ebf4; margin: 36px 20px 54px; }
        .birthday-calculator-standalone-root .timeline-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: inherit; background: linear-gradient(90deg,var(--brand),#14a896); }
        .birthday-calculator-standalone-root .timeline-dot { position: absolute; top: 50%; width: 18px; height: 18px; border-radius: 50%; transform: translate(-50%,-50%); border: 4px solid #fff; box-shadow: 0 0 0 2px var(--line); }
        .birthday-calculator-standalone-root .timeline-dot.last { left: 0; background: var(--brand); }
        .birthday-calculator-standalone-root .timeline-dot.today { background: #14a896; }
        .birthday-calculator-standalone-root .timeline-dot.next { left: 100%; background: #f0a515; }
        .birthday-calculator-standalone-root .timeline-label { position: absolute; top: 22px; transform: translateX(-50%); min-width: 105px; text-anchor: middle; text-align: center; color: var(--muted); font-size: .78rem; line-height: 1.35; }
        .birthday-calculator-standalone-root .timeline-label b { display: block; color: var(--ink); font-size: .84rem; }
        .birthday-calculator-standalone-root .planning-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-top: 24px; }
        .birthday-calculator-standalone-root .planning-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px; }
        .birthday-calculator-standalone-root .planning-card strong { display: block; color: var(--ink); font-size: 1.05rem; margin-bottom: 7px; }
        .birthday-calculator-standalone-root .planning-card p { margin: 0; color: var(--muted); font-size: .94rem; line-height: 1.65; }

        @media(max-width:1020px) {
          .birthday-calculator-standalone-root .nav-links { display: none; }
          .birthday-calculator-standalone-root .menu-btn { display: grid; }
          .birthday-calculator-standalone-root .hero-grid { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .hero-copy { padding-top: 0; }
          .birthday-calculator-standalone-root .calc-card { max-width: 720px; }
          .birthday-calculator-standalone-root .feature-grid { grid-template-columns: repeat(2,1fr); }
          .birthday-calculator-standalone-root .content-grid, .birthday-calculator-standalone-root .content-grid.equal { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .sticky-card, .birthday-calculator-standalone-root .faq-intro { position: relative; top: auto; }
          .birthday-calculator-standalone-root .example-grid, .birthday-calculator-standalone-root .related-grid, .birthday-calculator-standalone-root .guide-grid { grid-template-columns: repeat(2,1fr); }
          .birthday-calculator-standalone-root .footer-grid { grid-template-columns: 1fr 1fr; }
          .birthday-calculator-standalone-root .faq-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:680px) {
          .birthday-calculator-standalone-root .container { width: min(100% - 28px,var(--max)); }
          .birthday-calculator-standalone-root .nav { height: 66px; }
          .birthday-calculator-standalone-root .nav-pill { display: none; }
          .birthday-calculator-standalone-root .hero { padding: 32px 0 34px; }
          .birthday-calculator-standalone-root .hero h1 { font-size: 2.45rem; }
          .birthday-calculator-standalone-root .hero .lead { font-size: 1rem; }
          .birthday-calculator-standalone-root .calc-head { padding: 18px; }
          .birthday-calculator-standalone-root .private-pill { display: none; }
          .birthday-calculator-standalone-root .calc-body { padding: 18px; }
          .birthday-calculator-standalone-root .field-grid { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .calc-actions { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .result-top { display: block; }
          .birthday-calculator-standalone-root .result-tools { margin-top: 14px; }
          .birthday-calculator-standalone-root .age-line .years { font-size: 2.65rem; }
          .birthday-calculator-standalone-root .result-grid { grid-template-columns: 1fr 1fr; }
          .birthday-calculator-standalone-root .section { padding: 58px 0; }
          .birthday-calculator-standalone-root .section-head { display: block; }
          .birthday-calculator-standalone-root .feature-grid, .birthday-calculator-standalone-root .example-grid, .birthday-calculator-standalone-root .related-grid, .birthday-calculator-standalone-root .guide-grid { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .author-card { grid-template-columns: 1fr; }
          .birthday-calculator-standalone-root .cta { padding: 32px 22px; display: block; }
          .birthday-calculator-standalone-root .cta-actions { margin-top: 20px; }
          .birthday-calculator-standalone-root .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Navigation Header */}
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Age Calculator Lab home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
              </svg>
            </span>
            <span>Age Calculator Lab</span>
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="/">Calculators</a>
            <a href="/guides/">Guides</a>
            <a href="/methodology/">Methodology</a>
            <a href="/about/">About</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-pill" href="/">All 120 Calculators</a>
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="/">Calculators</a>
            <a href="/guides/">Guides</a>
            <a href="/methodology/">Methodology</a>
            <a href="/about/">About</a>
          </nav>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="container breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/">Calculators</a></li>
          <li aria-current="page">Birthday Countdown Calculator</li>
        </ol>
      </div>

      <main>
        {/* Hero Section */}
        <section className="hero" aria-labelledby="page-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="kicker">Birthday & Milestones · Free Online Tool</span>
              <h1 id="page-title">Birthday Countdown Calculator — Days Until Your Next Birthday</h1>
              <p className="lead">
                Enter your date of birth to find exactly how many calendar days remain until your next birthday. See the next birthday date, weekday, turning age, whole weeks plus days, days since your last birthday, and where today sits in your current birthday year.
              </p>
              <div className="trust-row" aria-label="Calculator highlights">
                <span className="trust-chip"><span className="tick">✓</span> Calendar-aware countdown</span>
                <span className="trust-chip"><span className="tick">✓</span> Leap years handled</span>
                <span className="trust-chip"><span className="tick">✓</span> Browser-side calculation</span>
                <span className="trust-chip"><span className="tick">✓</span> Copy & print</span>
              </div>
              <p className="muted" style={{ maxWidth: 690, margin: 0 }}>
                Use today for a live birthday countdown or choose another reference date to answer questions such as “How many days were left until my birthday on that date?” This page treats a February 29 birthday as February 28 in non-leap years and explains that convention below.
              </p>
              <div className="hero-meta">
                <span><strong>Updated:</strong> August 11, 2026</span>
                <span><strong>Method:</strong> Next-anniversary calendar arithmetic</span>
                <span><strong>Sign-up:</strong> Not required</span>
              </div>
              <div className="toc" aria-label="On this page">
                <a href="#how-to-use">How to use</a>
                <a href="#how-it-works">How it works</a>
                <a href="#planning">Planning</a>
                <a href="#examples">Examples</a>
                <a href="#faq">FAQ</a>
              </div>

              {/* Featured Banner Hero Image */}
              <figure className="hero-visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/birthday-countdown-calculator-hero.jpg"
                  alt="Birthday Countdown Calculator Banner Illustration"
                  width={1200}
                  height={675}
                />
              </figure>
            </div>

            {/* Interactive Calculator Card */}
            <div className="calc-card" id="calculator">
              <div className="calc-head">
                <div className="calc-head-left">
                  <span className="calc-icon" aria-hidden="true">🎂</span>
                  <div>
                    <strong>Birthday Countdown</strong>
                    <small>Date of birth → next birthday</small>
                  </div>
                </div>
                <span className="private-pill">● Runs in browser</span>
              </div>
              <div className="calc-body">
                <form id="birthdayForm" onSubmit={handleCalculate} noValidate>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="dob">Date of birth <span>Required</span></label>
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        autoComplete="bday"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="referenceDate">Countdown from <span>Defaults to today</span></label>
                      <input
                        id="referenceDate"
                        type="date"
                        name="referenceDate"
                        value={refDate}
                        onChange={(e) => setRefDate(e.target.value)}
                        required
                      />
                      <div className="quick-date">
                        <button type="button" onClick={() => setRefDate(todayISO())}>Today</button>
                        <button type="button" onClick={() => setRefDate(tomorrowISO())}>Tomorrow</button>
                      </div>
                    </div>
                  </div>
                  <div className="calc-actions">
                    <button className="btn btn-primary" type="submit">Calculate Birthday Countdown</button>
                    <button className="btn btn-secondary" id="resetBtn" type="button" onClick={handleReset}>Reset</button>
                  </div>
                  {errorMsg && <div id="calcError" className="error show" role="alert">{errorMsg}</div>}
                </form>
                <p className="calc-note">The calculator code in this page processes the entered dates locally in your browser.</p>

                {/* Calculation Results */}
                <section
                  id="calcResult"
                  ref={resultRef}
                  className={`result ${hasResult ? "show" : ""}`}
                  aria-live="polite"
                  aria-label="Birthday countdown result"
                >
                  <div className="result-top">
                    <div>
                      <div className="result-label">Time until your next birthday</div>
                      <div className="age-line">
                        <span className="years" id="daysOut">{daysOut}</span>
                        <span className="rest" id="daysLabel">{daysLabel}</span>
                      </div>
                    </div>
                    <div className="result-tools">
                      <button className="mini-btn" id="copyBtn" type="button" onClick={handleCopy}>{copyBtnText}</button>
                      <button className="mini-btn" type="button" onClick={() => window.print()}>Print</button>
                    </div>
                  </div>

                  <div className="countdown-orbit" aria-hidden="true">
                    <svg viewBox="0 0 120 120">
                      <circle className="track" cx="60" cy="60" r="50"/>
                      <circle
                        id="orbitProgress"
                        className="progress"
                        cx="60"
                        cy="60"
                        r="50"
                        strokeDasharray="314.159"
                        strokeDashoffset={dashOffset}
                      />
                    </svg>
                    <div className="countdown-center">
                      <b id="orbitDays">{orbitDays}</b>
                      <span id="orbitLabel">{orbitLabel}</span>
                    </div>
                  </div>

                  <div className="result-grid">
                    <div className="metric"><b id="nextDateOut">{nextDateOut}</b><small>Next birthday date</small></div>
                    <div className="metric"><b id="weekdayOut">{weekdayOut}</b><small>Birthday weekday</small></div>
                    <div className="metric"><b id="turningOut">{turningOut}</b><small>Turning age</small></div>
                    <div className="metric"><b id="weeksOut">{weeksOut}</b><small>Whole weeks + days</small></div>
                    <div className="metric"><b id="calendarOut">{calendarOut}</b><small>Calendar countdown</small></div>
                    <div className="metric"><b id="sinceLastOut">{sinceLastOut}</b><small>Days since last birthday</small></div>
                  </div>

                  <div className="birthday-banner">
                    <div className="emoji">🎉</div>
                    <div>
                      <b id="statusTitle">{statusTitle}</b>
                      <span id="statusText">{statusText}</span>
                    </div>
                  </div>
                  <div className="result-foot" id="resultFoot">{resultFoot}</div>
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="section soft" aria-labelledby="result-includes-title">
          <div className="container">
            <div className="section-head">
              <div className="copy">
                <div className="eyebrow">What the result includes</div>
                <h2 id="result-includes-title">More Than “How Many Days Until My Birthday?”</h2>
                <p>A useful birthday countdown should show the date you are counting toward, not only a large number. This calculator combines the day countdown with the birthday weekday, turning age and position within the current birthday year.</p>
              </div>
            </div>
            <div className="feature-grid">
              <article className="feature-card"><div className="feature-icon">#</div><h3>Days remaining</h3><p>The number of whole calendar days from the selected reference date to the next birthday anniversary.</p></article>
              <article className="feature-card"><div className="feature-icon">📅</div><h3>Birthday date & weekday</h3><p>See the exact calendar date and weekday so you can plan celebrations, travel, leave or reminders.</p></article>
              <article className="feature-card"><div className="feature-icon">🎂</div><h3>Turning age</h3><p>The completed age you will reach on the birthday date, based on the full date of birth.</p></article>
              <article className="feature-card"><div className="feature-icon">↔</div><h3>Birthday-year context</h3><p>See days since the last birthday and a progress view showing where the reference date falls between birthdays.</p></article>
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="section" id="how-to-use" aria-labelledby="how-use-title">
          <div className="container content-grid">
            <div className="prose">
              <div className="eyebrow">Step-by-step</div>
              <h2 id="how-use-title">How to Use the Birthday Countdown Calculator</h2>
              <p>The fastest way to calculate a birthday countdown is to enter the complete date of birth and leave the reference date set to today. The calculator finds the first birthday anniversary that falls on or after the reference date. If this year's birthday has already passed, it automatically rolls the target to the following year.</p>
              <div className="step-list">
                <div className="step"><div><b>Enter the complete date of birth.</b><p>The month and day identify the recurring birthday. The birth year is also used to calculate the age that will be reached on the next birthday.</p></div></div>
                <div className="step"><div><b>Choose the date to count from.</b><p>Use today for a current countdown. A past or future reference date lets you reconstruct or plan a birthday countdown from another point on the calendar.</p></div></div>
                <div className="step"><div><b>Select Calculate Birthday Countdown.</b><p>The browser creates the birthday anniversary in the reference year. If that anniversary is earlier than the reference date, the target is moved to the next year.</p></div></div>
                <div className="step"><div><b>Review the timing details.</b><p>Read the total days, whole weeks plus remaining days, calendar-month/day interval, exact birthday date, weekday, turning age and days since the previous birthday.</p></div></div>
                <div className="step"><div><b>Copy or print when useful.</b><p>Use the result summary for personal planning, invitations or reminders. For official age thresholds, use the relevant authority's rule rather than treating a birthday countdown as an eligibility decision.</p></div></div>
              </div>
              <div className="callout">
                <strong>If today is your birthday, the countdown is 0 days.</strong>
                <p>This page treats the birthday occurring on the reference date as the next/current birthday anniversary. If you want the countdown to the following year's birthday instead, move the reference date forward by one day.</p>
              </div>
            </div>
            <aside className="content-card sticky-card prose">
              <h3>Quick interpretation</h3>
              <p><strong>Birthday still ahead this year:</strong><br/>The target remains in the same calendar year.</p>
              <p><strong>Birthday already passed:</strong><br/>The target rolls into the following year.</p>
              <p><strong>Birthday is today:</strong><br/>The countdown returns 0 days and shows the age reached today.</p>
              <p><strong>February 29 birthday:</strong><br/>This build uses February 28 in non-leap years; the convention is explained below.</p>
              <a className="text-link" href="/guides/birthday-countdown-guide/">Read the Birthday Countdown Guide →</a>
            </aside>
          </div>
        </section>

        {/* How it works */}
        <section className="section soft" id="how-it-works" aria-labelledby="how-works-title">
          <div className="container content-grid">
            <div className="prose">
              <div className="eyebrow">Calendar logic</div>
              <h2 id="how-works-title">How a Birthday Countdown Is Calculated</h2>
              <p>A birthday countdown is a next-anniversary calculation. The date of birth supplies the recurring month and day, while the reference date determines whether the birthday belongs to the current year or the next year. The countdown is then the number of elapsed calendar days from the reference date to that anniversary.</p>
              <div className="formula">Next birthday = birthday anniversary in reference year → if already passed, move to next year</div>
              <p>For example, if a birthday is May 20 and the reference date is April 10, the next birthday is May 20 of the same year. If the reference date is August 10, May 20 has already passed, so the next birthday is May 20 of the following year. This rollover step prevents negative countdowns.</p>
              <p>The calculator uses date-only values and performs day differences on UTC-normalized calendar dates. That avoids the common problem where daylight-saving changes or local time-of-day offsets make a date-only countdown appear one day too high or too low.</p>
              <h3>What does “days until” mean?</h3>
              <p>The day count is an elapsed-day difference between two dates. If the reference date is August 10 and the birthday is August 11, the countdown is 1 day. If both dates are August 10, the countdown is 0 days. The calculator does not include hours or minutes because the form does not ask for a birth time or target time.</p>
            </div>
            <aside className="content-card sticky-card prose">
              <h3>Calendar countdown vs. clock countdown</h3>
              <p><strong>This calculator:</strong> uses whole calendar dates.</p>
              <p><strong>It does not:</strong> estimate hours, minutes or seconds until midnight in a particular time zone.</p>
              <p>That distinction is useful because a date-only result remains stable and understandable without requiring a time of birth, current time or location.</p>
            </aside>
          </div>
        </section>

        {/* Timeline section */}
        <section className="section" aria-labelledby="birthday-year-title">
          <div className="container">
            <div className="section-head">
              <div className="copy">
                <div className="eyebrow">Birthday-year timeline</div>
                <h2 id="birthday-year-title">From Your Last Birthday to Your Next Birthday</h2>
                <p>A birthday countdown can also be viewed as your position inside a personal birthday year: the interval beginning on one birthday anniversary and ending on the next.</p>
              </div>
            </div>
            <div className="content-grid">
              <div className="prose">
                <p>The calculator reports <strong>days since your last birthday</strong> alongside days until the next one. These two intervals make it easier to understand how far you have progressed through the current birthday year. The exact length of that birthday year can be 365 or 366 days depending on leap-year boundaries and the birthday date.</p>
                <p>This is different from saying a birthday is a fixed number of days away every year. A yearly anniversary is defined by a month and day on the calendar, so the number of elapsed days between consecutive birthdays can change when February 29 lies inside the interval.</p>
                <div className="timeline-card">
                  <div className="timeline-line">
                    <div className="timeline-fill" style={{ width: '64%' }}></div>
                    <div className="timeline-dot last"><span className="timeline-label"><b>Last birthday</b>start of birthday year</span></div>
                    <div className="timeline-dot today" style={{ left: '64%' }}><span className="timeline-label"><b>Reference date</b>your current position</span></div>
                    <div className="timeline-dot next"><span className="timeline-label"><b>Next birthday</b>new age reached</span></div>
                  </div>
                </div>
              </div>
              <aside className="content-card prose">
                <h3>Why show the full birthday year?</h3>
                <p>A single countdown answers “how long remains?” The full timeline adds context: whether your birthday was recent, whether you are near the midpoint of the year, and how the remaining interval compares with time already elapsed.</p>
                <p>If you want to explore the midpoint itself, use the <a href="/tools/half-birthday-calculator/">Half Birthday Calculator</a>.</p>
              </aside>
            </div>
          </div>
        </section>

        {/* Leap day section */}
        <section className="section soft" aria-labelledby="leap-title">
          <div className="container content-grid">
            <div className="prose">
              <div className="eyebrow">Leap-day birthdays</div>
              <h2 id="leap-title">How the Countdown Handles February 29 Birthdays</h2>
              <p>February 29 exists only in leap years. A leap year is generally divisible by 4, but century years are not leap years unless they are divisible by 400. For example, 2000 was a leap year; 1900 was not.</p>
              <p>When a person is born on February 29, a general birthday countdown needs a convention for non-leap years because the literal anniversary date is absent. In this standalone implementation, <strong>February 28 is used as the birthday anniversary in non-leap years</strong>. In leap years, the target remains February 29.</p>
              <div className="callout warn">
                <strong>This is a calculator convention, not a universal legal rule.</strong>
                <p>People may personally observe a leap-day birthday on February 28 or March 1, and legal treatment can vary by jurisdiction or policy. If an age threshold, contract, benefit or legal requirement depends on the anniversary date, verify the controlling rule independently.</p>
              </div>
              <p>By stating the convention explicitly, the result remains reproducible: you can understand exactly why a particular target date and day count were returned.</p>
            </div>
            <figure className="visual-card sticky-card">
              <svg viewBox="0 0 420 315" role="img" aria-label="February calendar illustration showing leap day">
                <rect x="56" y="34" width="308" height="246" rx="26" fill="#fff" stroke="#dfe3ef"/>
                <rect x="56" y="34" width="308" height="65" rx="26" fill="#5b57e8"/>
                <text x="210" y="76" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">FEBRUARY</text>
                <g fontSize="16" fontWeight="800" textAnchor="middle">
                  <circle cx="130" cy="178" r="32" fill="#f3f4f8"/><text x="130" y="184" fill="#68718a">28</text>
                  <circle cx="210" cy="178" r="38" fill="#efefff" stroke="#5b57e8" strokeWidth="3"/><text x="210" y="184" fill="#5b57e8">29</text>
                  <circle cx="290" cy="178" r="32" fill="#fff7df"/><text x="290" y="184" fill="#b67600">1</text>
                </g>
                <text x="210" y="245" textAnchor="middle" fill="#68718a" fontSize="13">Leap years include February 29.</text>
              </svg>
            </figure>
          </div>
        </section>

        {/* Planning */}
        <section className="section" id="planning" aria-labelledby="planning-title">
          <div className="container">
            <div className="section-head">
              <div className="copy">
                <div className="eyebrow">Use the countdown</div>
                <h2 id="planning-title">Planning Around an Upcoming Birthday</h2>
                <p>A countdown becomes more useful when you connect the day total to a real planning task. The date and weekday help you decide when invitations, travel, leave requests or reminders need to happen.</p>
              </div>
            </div>
            <div className="planning-grid">
              <article className="planning-card"><strong>Celebration planning</strong><p>Use the exact birthday weekday to decide whether to celebrate on the date itself or on a nearby weekend. The countdown gives a simple planning horizon for venues, invitations and catering.</p></article>
              <article className="planning-card"><strong>Travel & leave</strong><p>Knowing the target weekday can help when a birthday trip requires flights, accommodation or time away from work or school. Treat the countdown as a calendar aid rather than a booking recommendation.</p></article>
              <article className="planning-card"><strong>Gift reminders</strong><p>Convert the countdown into practical checkpoints: order by a chosen date, ship before another date, or set a reminder several days in advance.</p></article>
              <article className="planning-card"><strong>Family birthdays</strong><p>Run the calculator for different birth dates to organize upcoming birthdays across a family. For a broader multi-person view, a birthday calendar tool may be more convenient.</p></article>
              <article className="planning-card"><strong>Milestone birthdays</strong><p>If the next birthday is a culturally important age such as 18, 21, 30, 40, 50 or another personal milestone, use the date as a planning anchor. The importance of particular ages varies by culture and context.</p></article>
              <article className="planning-card"><strong>Personal reflection</strong><p>The countdown can also be a simple personal marker for annual goals, journals or traditions without attaching any formal significance to the date.</p></article>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="section soft" aria-labelledby="milestones-title">
          <div className="container content-grid">
            <div className="prose">
              <div className="eyebrow">Beyond the next birthday</div>
              <h2 id="milestones-title">Birthday Milestones You Can Explore Next</h2>
              <p>The next annual birthday is only one kind of milestone. Other birthday tools transform the same birth date into culturally interesting or personally useful dates. These milestones are best treated as planning or curiosity tools unless an official rule explicitly gives an age legal or administrative significance.</p>
              <h3>Milestone ages</h3>
              <p>Commonly celebrated milestone ages can include 18, 21, 30, 40, 50, 65, 75 or 100, but their significance varies by country, culture, family and individual. A <a href="/tools/milestone-birthday-calculator/">Milestone Birthday Calculator</a> can map chosen ages to exact future dates.</p>
              <h3>Half birthdays</h3>
              <p>A half birthday is a conventional midpoint between annual birthdays. Because months have unequal lengths, “six months after the birthday” and “half the number of days in a birthday year” are not always the same date. A dedicated <a href="/tools/half-birthday-calculator/">Half Birthday Calculator</a> should state which convention it uses.</p>
              <h3>Golden birthdays</h3>
              <p>A golden birthday commonly refers to the birthday on which a person's age matches the day number of their birth date—for example, turning 24 on the 24th. This is a cultural convention, not a calendar or legal standard.</p>
            </div>
            <aside className="content-card sticky-card prose">
              <h3>Related birthday questions</h3>
              <p><a href="/tools/birthday-calculator/">Birthday Calculator</a><br/><span className="muted">Explore birthday facts and date context.</span></p>
              <p><a href="/tools/half-birthday-calculator/">Half Birthday Calculator</a><br/><span className="muted">Find the midpoint-style birthday date.</span></p>
              <p><a href="/tools/age-calculator/">Age Calculator</a><br/><span className="muted">Calculate exact current age in years, months and days.</span></p>
              <p><a href="/tools/time-between-dates/">Time Between Dates</a><br/><span className="muted">Measure another calendar interval.</span></p>
            </aside>
          </div>
        </section>

        {/* Examples */}
        <section className="section" id="examples" aria-labelledby="examples-title">
          <div className="container">
            <div className="section-head">
              <div className="copy">
                <div className="eyebrow">Worked scenarios</div>
                <h2 id="examples-title">Birthday Countdown Examples</h2>
                <p>These examples demonstrate the rollover and anniversary logic. Exact day totals depend on the specific dates and leap-year boundaries in the interval.</p>
              </div>
            </div>
            <div className="example-grid">
              <article className="example-card"><h3>Birthday later this year</h3><p><strong>Birthday:</strong> November 15<br/><strong>Reference date:</strong> August 10</p><p>The November birthday has not happened yet, so the target remains November 15 in the same calendar year.</p></article>
              <article className="example-card"><h3>Birthday already passed</h3><p><strong>Birthday:</strong> May 20<br/><strong>Reference date:</strong> August 10</p><p>May 20 has already passed, so the calculator moves the target to May 20 of the following year before counting days.</p></article>
              <article className="example-card"><h3>Birthday is today</h3><p><strong>Birthday:</strong> August 10<br/><strong>Reference date:</strong> August 10</p><p>The countdown is 0 days. The current/reference date is itself the birthday anniversary.</p></article>
              <article className="example-card"><h3>New Year boundary</h3><p><strong>Birthday:</strong> January 5<br/><strong>Reference date:</strong> December 28</p><p>The next birthday belongs to the next calendar year. The calculator crosses the December-to-January boundary normally.</p></article>
              <article className="example-card"><h3>Leap-day birthday</h3><p><strong>Birth date:</strong> February 29<br/><strong>Non-leap target year</strong></p><p>This implementation uses February 28 as the anniversary date in a non-leap year and February 29 in a leap year.</p></article>
              <article className="example-card"><h3>Historical countdown</h3><p><strong>Reference date:</strong> a date in the past</p><p>Changing the reference date lets you reconstruct how many days remained until the next birthday from that earlier point in time.</p></article>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="section" aria-labelledby="method-title">
          <div className="container content-grid">
            <div className="prose">
              <div className="eyebrow">Methodology & accuracy</div>
              <h2 id="method-title">How Age Calculator Lab Approaches Birthday Countdown Accuracy</h2>
              <p>The countdown in this page is designed around calendar dates rather than approximate month lengths or an assumed 365-day year. It identifies the next valid birthday anniversary, converts the reference and target dates to UTC-based date values, and calculates the elapsed whole-day difference.</p>
              <p>The implementation is also tested conceptually against the boundaries where birthday tools tend to fail: the day before a birthday, the birthday itself, the day after, year-end rollover, leap years and February 29 birth dates. The visible result includes the chosen target birthday so the user can inspect the date that produced the countdown.</p>
              <p>The calendar-month/day sub-result is a separate view of the same interval. It counts complete calendar months from the reference date to the target birthday and then the remaining days. It should not be treated as a fixed conversion where one month always equals 30 days.</p>
              <div className="callout">
                <strong>Accuracy is partly about making conventions visible.</strong>
                <p>A day count can be mathematically consistent while a policy-sensitive interpretation still depends on external rules. That is especially relevant for leap-day anniversaries and formal age thresholds.</p>
              </div>
              <a className="text-link" href="/methodology/">Read the full calculation methodology →</a>
            </div>
            <aside className="content-card sticky-card prose">
              <h3>Calculation conventions in this HTML</h3>
              <p><strong>Reference date:</strong> defaults to today's local calendar date.</p>
              <p><strong>Day subtraction:</strong> normalized to UTC date values.</p>
              <p><strong>Birthday today:</strong> returns 0 days.</p>
              <p><strong>Passed birthday:</strong> rolls to the next year.</p>
              <p><strong>Feb. 29 in non-leap years:</strong> February 28.</p>
              <p><strong>Hours/minutes:</strong> intentionally not estimated.</p>
            </aside>
          </div>
        </section>

        {/* Author */}
        <section className="section" aria-labelledby="author-title">
          <div className="container">
            <div className="author-card">
              <div className="author-avatar" aria-hidden="true">NK</div>
              <div>
                <div className="eyebrow">Written by</div>
                <h3 id="author-title">Navjeet Kamboj</h3>
                <p>Founder & Lead Utility Analyst at Age Calculator Lab. Navjeet builds the site around transparent calendar arithmetic, focused date tools and clear explanations of the assumptions that matter when birthdays, leap years and age milestones are involved.</p>
                <div className="author-meta">
                  <span>Updated August 11, 2026</span>
                  <a href="/methodology/">How we calculate dates →</a>
                  <a href="/about/">About Age Calculator Lab →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section soft" id="faq" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="faq-intro">
              <div className="eyebrow">Questions answered</div>
              <h2 id="faq-title">Birthday Countdown Calculator FAQ</h2>
              <p>Answers to common questions about next birthdays, day counting, leap-day birthdays, turning age and browser-side calculation.</p>
            </div>
            <div className="faq-list">
              <details open><summary>How do I calculate how many days are left until my birthday?</summary><p>Enter your complete date of birth and use today as the reference date. The calculator creates your birthday anniversary in the current year. If that date is today or still ahead, it becomes the target. If it has already passed, the target moves to the following year. The elapsed whole-day difference between the reference date and target is the birthday countdown.</p></details>
              <details><summary>What happens if my birthday has already passed this year?</summary><p>The calculator automatically rolls the birthday into the next calendar year. This is a necessary step because using the birthday only in the current year would produce a past target and potentially a negative day count.</p></details>
              <details><summary>What does the calculator show if today is my birthday?</summary><p>It shows 0 days remaining and treats the reference date as the current birthday anniversary. The turning-age result is the age reached on that date. If you want to count down to the following year's birthday instead, move the reference date one day forward.</p></details>
              <details><summary>Can I calculate a birthday countdown from a past date?</summary><p>Yes. Change the “Countdown from” date to a past date. The calculator will identify the next birthday anniversary on or after that historical reference date. This can be useful for reconstructing a past planning timeline or checking how far away a birthday was at an earlier point.</p></details>
              <details><summary>Can I calculate a birthday countdown from a future date?</summary><p>Yes, as long as the reference date is not before the date of birth. The same anniversary logic applies: the calculator finds the first birthday on or after the chosen future date and counts calendar days to it.</p></details>
              <details><summary>How are February 29 birthdays handled?</summary><p>This standalone implementation uses February 28 as the birthday anniversary in non-leap years and February 29 in leap years. That is an explicit calculator convention, not a universal legal rule. Personal celebration choices and formal legal treatment can differ.</p></details>
              <details><summary>Does the countdown include today?</summary><p>The result is an elapsed-day difference. A birthday tomorrow is 1 day away; a birthday on the reference date is 0 days away. This avoids ambiguity about inclusive counting and aligns the number with the actual distance between the two calendar dates.</p></details>
              <details><summary>Why doesn't this calculator show hours, minutes and seconds?</summary><p>The form collects calendar dates, not times or time zones. Showing a clock-style countdown would therefore introduce assumptions about midnight, location and current time. This tool intentionally reports date-based results—days, weeks and calendar months/days—without pretending to know a more precise time than the inputs support.</p></details>
              <details><summary>How is my turning age calculated?</summary><p>The calculator compares your complete date of birth with the next birthday anniversary. The turning age is the number of calendar years between the birth year and the target birthday year, with the birthday month and day forming the anniversary itself.</p></details>
              <details><summary>Why can the interval between birthdays be 365 or 366 days?</summary><p>Because a leap day can fall inside the birthday-to-birthday interval. The anniversary is defined by calendar date, not by adding a fixed 365-day duration every year. This is one reason birthday countdowns should use real calendar arithmetic.</p></details>
              <details><summary>Can I use the countdown for legal or benefit eligibility?</summary><p>Use it to organize the dates, not to make the final eligibility decision. Laws, benefits, school admissions, contracts and other regulated rules may define age thresholds or leap-day anniversaries in specific ways. Verify the controlling rule with the relevant current authority.</p></details>
              <details><summary>Does Age Calculator Lab save my birth date?</summary><p>The calculator code in this standalone page runs in your browser and does not submit the entered birth date or reference date to a server as part of the calculation. A production website may still use analytics, advertising or other services that process separate technical data, which should be disclosed in the Privacy Policy.</p></details>
              <details><summary>What is the difference between a Birthday Countdown and Birthday Calculator?</summary><p>A Birthday Countdown focuses on the time remaining until the next anniversary. A broader Birthday Calculator may show additional birthday facts, calendar context or milestone information. Use the focused countdown when the main question is simply “when is my next birthday and how long until it arrives?”</p></details>
              <details><summary>How is a birthday countdown different from an age calculator?</summary><p>An Age Calculator measures elapsed time from birth to a reference date. A Birthday Countdown measures the remaining time from a reference date to the next birthday anniversary. They use the same birth date but answer opposite directions on the timeline: elapsed age versus time remaining.</p></details>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container">
            <div className="cta">
              <div className="cta-copy">
                <h2>Want to explore another birthday or date milestone?</h2>
                <p>Browse focused tools for exact age, half birthdays, milestone birthdays, date intervals, age differences and personal calendar planning.</p>
              </div>
              <div className="cta-actions">
                <a className="btn btn-primary" href="/">Browse All Calculators</a>
                <a className="btn btn-secondary" href="/guides/">Explore Guides</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href="/">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <path d="M16 3v4M8 3v4M3 10h18"/>
                  </svg>
                </span>
                <span>Age Calculator Lab</span>
              </a>
              <p>Free, focused tools for exact age arithmetic, birthday countdowns, milestones, date math and life planning.</p>
            </div>
            <div className="footer-col">
              <h3>Popular Calculators</h3>
              <a href="/tools/age-calculator/">Age Calculator</a>
              <a href="/tools/birthday-countdown-calculator/">Birthday Countdown</a>
              <a href="/tools/age-difference-calculator/">Age Difference</a>
              <a href="/tools/time-between-dates/">Time Between Dates</a>
              <a href="/tools/age-in-days-calculator/">Age in Days</a>
            </div>
            <div className="footer-col">
              <h3>Resources</h3>
              <a href="/">All Calculators</a>
              <a href="/guides/">Guides Hub</a>
              <a href="/guides/how-age-calculators-work/">How Age Calculators Work</a>
              <a href="/methodology/">Methodology & Sources</a>
              <a href="/about/">About Us</a>
            </div>
            <div className="footer-col">
              <h3>Legal & Privacy</h3>
              <a href="/privacy/">Privacy Policy</a>
              <a href="/terms/">Terms of Use</a>
              <a href="/disclaimer/">Disclaimer</a>
              <a href="/sitemap.xml">Sitemap</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Age Calculator Lab. All rights reserved.</span>
            <span>Informational tools · No sign-up required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
