 /**
  * Schedule Configuration Module
  * Manages user's outdoor activity hours for rain probability analysis
  */
 
 const SCHEDULE = (function() {
     // Default schedule configuration (can be customized by user)
     const DEFAULT_SCHEDULE = {
         // Weekdays (Monday-Friday): 07:30-08:30 and 14:00-15:30
         weekday: [
             { start: "07:30", end: "08:30", label: "Mati (desplacament)" },
             { start: "14:00", end: "15:30", label: "Tarda (tornada)" }
         ],
         // Weekends (Saturday-Sunday): 10:00-20:00
         weekend: [
             { start: "10:00", end: "20:00", label: "Activitats exteriors" }
         ]
     };
 
     // Load user schedule from localStorage or use defaults
     function loadSchedule() {
         try {
             const saved = localStorage.getItem("userSchedule");
             if (saved) {
                 return JSON.parse(saved);
             }
         } catch (e) {
             console.warn("[SCHEDULE] Error loading schedule, using defaults:", e);
         }
         return DEFAULT_SCHEDULE;
     }
 
     // Save user schedule to localStorage
     function saveSchedule(schedule) {
         try {
             localStorage.setItem("userSchedule", JSON.stringify(schedule));
             return true;
         } catch (e) {
             console.error("[SCHEDULE] Error saving schedule:", e);
             return false;
         }
     }
 
     // Get current schedule (weekday or weekend based on today)
     function getCurrentSchedule() {
         const schedule = loadSchedule();
         const now = new Date();
         const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
         const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
         return isWeekend ? schedule.weekend : schedule.weekday;
     }
 
     // Check if a specific hour falls within any outdoor activity period
     function isHourOutdoor(hour, minute) {
         if (minute === undefined) minute = 0;
         const schedule = getCurrentSchedule();
         const timeMinutes = hour * 60 + minute;
         
         return schedule.some(function(period) {
             const startParts = period.start.split(":");
             const endParts = period.end.split(":");
             const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
             const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
             
             return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
         });
     }
 
     // Get all outdoor hours for a given day
     function getOutdoorHours() {
         const schedule = getCurrentSchedule();
         const outdoorHours = [];
         
         schedule.forEach(function(period) {
             const startParts = period.start.split(":");
             const endParts = period.end.split(":");
             const startHour = parseInt(startParts[0]);
             const startMinute = parseInt(startParts[1]);
             const endHour = parseInt(endParts[0]);
             const endMinute = parseInt(endParts[1]);
             
             // Add each hour that falls within the period
             for (var h = startHour; h <= endHour; h++) {
                 var m = (h === startHour) ? startMinute : 0;
                 var endM = (h === endHour) ? endMinute : 59;
                 if (h === startHour && h === endHour) {
                     if (m <= endMinute) outdoorHours.push({ hour: h, minute: m, period: period });
                 } else if (h === startHour) {
                     outdoorHours.push({ hour: h, minute: m, period: period });
                 } else if (h === endHour) {
                     for (var mm = 0; mm <= endMinute; mm += 30) {
                         outdoorHours.push({ hour: h, minute: mm, period: period });
                     }
                 } else {
                     outdoorHours.push({ hour: h, minute: 0, period: period });
                     outdoorHours.push({ hour: h, minute: 30, period: period });
                 }
             }
         });
         
         return outdoorHours;
     }
 
     // Get schedule as human-readable string
     function getScheduleDescription() {
         const schedule = loadSchedule();
         const now = new Date();
         const dayOfWeek = now.getDay();
         const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
         const periods = isWeekend ? schedule.weekend : schedule.weekday;
         
         return periods.map(function(p) { return p.label + ": " + p.start + "–" + p.end; }).join(", ");
     }
 
     // Public API
     const publicAPI = {
         loadSchedule: loadSchedule,
         saveSchedule: saveSchedule,
         getCurrentSchedule: getCurrentSchedule,
         isHourOutdoor: isHourOutdoor,
         getOutdoorHours: getOutdoorHours,
         getScheduleDescription: getScheduleDescription,
         DEFAULT_SCHEDULE: DEFAULT_SCHEDULE
     };
 
     if (typeof window !== "undefined") {
         window.SCHEDULE = publicAPI;
     }
 
     return publicAPI;
 })();
