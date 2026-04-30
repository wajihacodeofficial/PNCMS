export const personnel = [
  { svc: '10420', name: 'Muhammad Tariq Khan', rank: 'Assistant', dept: 'Administration', cardType: 'Ministerial', bps: 'BPS-16', cnic: '42101-1234567-1', status: 'Active', gender: 'Male' },
  { svc: '10430', name: 'Aisha Rehman', rank: 'UDC', dept: 'Engineering Wing', cardType: 'Ministerial', bps: 'BPS-14', cnic: '42201-2345678-2', status: 'Active', gender: 'Female' },
  { svc: '10440', name: 'Bilal Ahmed Siddiqui', rank: 'Draftsman', dept: 'Naval Dockyard', cardType: 'Industrial', bps: 'BPS-12', cnic: '42301-3456789-3', status: 'Active', gender: 'Male' },
  { svc: '10450', name: 'Fatima Zahra', rank: 'LDC', dept: 'Personnel Records', cardType: 'Ministerial', bps: 'BPS-11', cnic: '42401-4567890-4', status: 'Active', gender: 'Female' },
  { svc: '10460', name: 'Imran Hussain Shah', rank: 'Stenographer', dept: 'Naval Headquarters', cardType: 'Ministerial', bps: 'BPS-16', cnic: '42501-5678901-5', status: 'Active', gender: 'Male' },
  { svc: '10470', name: 'Saima Nawaz', rank: 'Technician', dept: 'Logistics Command', cardType: 'Industrial', bps: 'BPS-14', cnic: '42601-6789012-6', status: 'Active', gender: 'Female' },
  { svc: '10480', name: 'Asad Mehmood Qureshi', rank: 'Driver', dept: 'Transport Pool', cardType: 'Ministerial', bps: 'BPS-07', cnic: '42701-7890123-7', status: 'Active', gender: 'Male' },
  { svc: '10490', name: 'Nazia Akhtar', rank: 'Assistant', dept: 'Finance Directorate', cardType: 'Ministerial', bps: 'BPS-16', cnic: '42801-8901234-8', status: 'Active', gender: 'Female' },
  { svc: '10500', name: 'Zubair Ahmed', rank: 'Foreman', dept: 'Naval Dockyard', cardType: 'Industrial', bps: 'BPS-16', cnic: '42901-9012345-9', status: 'Active', gender: 'Male' },
  { svc: '10510', name: 'Sumera Bano', rank: 'Data Entry Op', dept: 'IT Center', cardType: 'Ministerial', bps: 'BPS-12', cnic: '42001-0123456-0', status: 'Active', gender: 'Female' },
];

export const sanctions = [
  { id: 'SNC-2026-0130', emp: 'Muhammad Tariq Khan', svc: '10420', dept: 'Administration', hours: 40, period: 'March 2026', status: 'Approved', date: '2026-03-15', cadre: 'Ministerial' },
  { id: 'SNC-2026-0131', emp: 'Bilal Ahmed Siddiqui', svc: '10440', dept: 'Naval Dockyard', hours: 60, period: 'March 2026', status: 'Approved', date: '2026-03-16', cadre: 'Industrial' },
  { id: 'SNC-2026-0142', emp: 'Aisha Rehman', svc: '10430', dept: 'Engineering Wing', hours: 60, period: 'April 2026', status: 'Pending', date: '2026-04-21', cadre: 'Ministerial' },
  { id: 'SNC-2026-0143', emp: 'Saima Nawaz', svc: '10470', dept: 'Logistics Command', hours: 30, period: 'April 2026', status: 'Approved', date: '2026-04-18', cadre: 'Industrial' },
  { id: 'SNC-2026-0144', emp: 'Zubair Ahmed', svc: '10500', dept: 'Naval Dockyard', hours: 45, period: 'April 2026', status: 'Approved', date: '2026-04-22', cadre: 'Industrial' },
];

export const payments = [
  { emp: 'Imran Hussain Shah', svc: '10460', cadre: 'Ministerial', type: 'Late-Sitting', gross: 45, leave: 2, payable: 43, rate: 380, amount: 16340, status: 'Pending', period: 'February 2026' },
  { emp: 'Nazia Akhtar', svc: '10490', cadre: 'Ministerial', type: 'Late-Sitting', gross: 50, leave: 0, payable: 50, rate: 350, amount: 17500, status: 'Paid', period: 'February 2026' },
  { emp: 'Fatima Zahra', svc: '10450', cadre: 'Ministerial', type: 'Late-Sitting', gross: 30, leave: 4, payable: 26, rate: 350, amount: 9100, status: 'Processed', period: 'February 2026' },
  { emp: 'Bilal Ahmed Siddiqui', svc: '10440', cadre: 'Industrial', type: 'Overtime', gross: 55, leave: 0, payable: 55, rate: 420, amount: 23100, status: 'Pending', period: 'February 2026' },
];

export const disciplinaryActions = [
  { id: 'CASE-2026-001', svc: '10500', name: 'Zubair Ahmed', type: 'Inquiry', offense: 'Operational Negligence', action: 'Suspension', date: '2026-04-25', status: 'Ongoing', remarks: 'Unauthorized absence from workshop during duty hours.', ref: 'NHQ/DIS/2026/01', details: 'Individual failed to report at 0800 muster. Found in canteen area.', authority: 'Commanding Officer' },
  { id: 'CASE-2026-002', svc: '10480', name: 'Asad Mehmood Qureshi', type: 'Warning', offense: 'Reckless Driving', action: 'Written Warning', date: '2026-04-20', status: 'Closed', remarks: 'Reckless driving of transport pool vehicle.', ref: 'NHQ/DIS/2026/02', details: 'Vehicle DIL-042 speed violation reported by security.', authority: 'Cdr. Saif ur Rehman' },
  { id: 'CASE-2026-003', svc: '10440', name: 'Bilal Ahmed Siddiqui', type: 'Inquiry', offense: 'Inventory Discrepancy', action: 'Suspension', date: '2026-03-15', status: 'Ongoing', remarks: 'Discrepancy in drawing materials inventory.', ref: 'NHQ/DIS/2026/03', details: 'Quarterly audit revealed missing technical drawings.', authority: 'Cdr. Imtiaz Ali' },
];

export const leaveRecords = [
  { id: 1, svc: '10440', name: 'Bilal Ahmed Siddiqui', type: 'CL', from: '2026-04-20', to: '2026-04-22', days: 3, status: 'Submitted' },
  { id: 2, svc: '10470', name: 'Saima Nawaz', type: 'ML', from: '2026-05-01', to: '2026-07-29', days: 90, status: 'Approved' },
  { id: 3, svc: '10510', name: 'Sumera Bano', type: 'CL', from: '2026-04-10', to: '2026-04-10', days: 1, status: 'Submitted' },
  { id: 4, svc: '10450', name: 'Fatima Zahra', type: 'RL', from: '2026-04-15', to: '2026-04-25', days: 10, status: 'Submitted' },
];

export const activity = [
  { time: '11:42', text: 'Sanction SNC-2026-0142 (Ministerial) submitted for Aisha Rehman', tag: 'SANCTION' },
  { time: '10:18', text: 'Work log closed for Tariq Khan (Ministerial) — 40 late-sitting hrs', tag: 'WORK LOG' },
  { time: '09:55', text: 'Payment batch FEB-2026 (Industrial) disbursed', tag: 'PAYMENT' },
  { time: '08:30', text: 'Daily muster roll opened by Admin Clerk', tag: 'ATTENDANCE' },
  { time: '08:12', text: 'Disciplinary hearing scheduled — Zubair Ahmed (Svc 10500)', tag: 'DISCIPLINE' },
];

// Mock Month Attendance (April 2026)
export const attendanceHistory = {
  "2026-04-01": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "P" },
  "2026-04-02": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "P" },
  "2026-04-03": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "P" },
  "2026-04-04": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "P" },
  "2026-04-05": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "A", "10510": "P" }, // Zubair Absent
  "2026-04-10": { "10420": "P", "10430": "P", "10440": "P", "10450": "P", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "CL" }, // Sumera CL
  "2026-04-20": { "10420": "P", "10430": "P", "10440": "CL", "10450": "RL", "10460": "P", "10470": "P", "10480": "P", "10490": "P", "10500": "P", "10510": "P" }, // Bilal CL, Fatima RL
};
