/**
 * Conception Events Manager
 * Automatically organizes events into "Upcoming" and "Previous" lists
 * based on current date and time, eliminating manual updates when dates pass.
 */
(function () {
    "use strict";

    /**
     * Parse date and time from event list item text or child elements.
     * Expected format: DD/MM/YYYY [HH:MM-HH:MM]
     * e.g. "11/12/2026 19:00-23:00, Hope House"
     */
    function parseEventDate(element) {
        // Check for semantic <time datetime="..."> attribute first
        const timeEl = element.querySelector("time[datetime]");
        if (timeEl) {
            const dtAttr = timeEl.getAttribute("datetime");
            const parsedDt = new Date(dtAttr);
            if (!isNaN(parsedDt.getTime())) {
                // Default end date to 4 hours later or end of day
                const endDate = new Date(parsedDt.getTime() + 4 * 60 * 60 * 1000);
                return { startDate: parsedDt, endDate: endDate };
            }
        }

        const text = element.textContent.trim();

        // Match date in DD/MM/YYYY format
        const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!dateMatch) return null;

        const day = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10);
        const year = parseInt(dateMatch[3], 10);

        // Optional time range: HH:MM or HH:MM-HH:MM
        const timeMatch = text.match(/(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
        let startHour = 19;
        let startMin = 0;
        let endHour = 23;
        let endMin = 0;

        if (timeMatch) {
            startHour = parseInt(timeMatch[1], 10);
            startMin = parseInt(timeMatch[2], 10);
            if (timeMatch[3] !== undefined && timeMatch[4] !== undefined) {
                endHour = parseInt(timeMatch[3], 10);
                endMin = parseInt(timeMatch[4], 10);
            } else {
                endHour = 23;
                endMin = 59;
            }
        } else {
            startHour = 0;
            startMin = 0;
            endHour = 23;
            endMin = 59;
        }

        const startDate = new Date(year, month - 1, day, startHour, startMin, 0);
        const endDate = new Date(year, month - 1, day, endHour, endMin, 59);

        return { startDate, endDate };
    }

    function organizeEvents() {
        const upcomingList =
            document.querySelector("#upcoming-events") ||
            document.querySelector(".events-list[aria-label='Upcoming events']");
        const previousList =
            document.querySelector("#previous-events") ||
            document.querySelector(".events-list[aria-label='Previous events']");

        if (!upcomingList || !previousList) return;

        // Collect all event li elements across both lists
        const allItems = [];
        const seenKeys = new Set();

        [upcomingList, previousList].forEach(function (list) {
            const items = list.querySelectorAll("li");
            items.forEach(function (li) {
                if (li.classList.contains("no-events")) return;

                const parsed = parseEventDate(li);
                if (parsed) {
                    // Unique identifier to avoid duplicating if re-run
                    const key = parsed.startDate.getTime() + "-" + li.innerHTML.trim();
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        allItems.push({
                            element: li,
                            startDate: parsed.startDate,
                            endDate: parsed.endDate,
                        });
                    }
                }
            });
        });

        const now = new Date();
        const upcomingEvents = [];
        const previousEvents = [];

        allItems.forEach(function (item) {
            // Event remains "Upcoming" until its end time has passed
            if (now <= item.endDate) {
                upcomingEvents.push(item);
            } else {
                previousEvents.push(item);
            }
        });

        // Upcoming: sorted soonest first (ascending)
        upcomingEvents.sort(function (a, b) {
            return a.startDate - b.startDate;
        });

        // Previous: sorted most recent first (descending)
        previousEvents.sort(function (a, b) {
            return b.startDate - a.startDate;
        });

        // Render upcoming events
        upcomingList.innerHTML = "";
        if (upcomingEvents.length > 0) {
            upcomingEvents.forEach(function (ev) {
                upcomingList.appendChild(ev.element);
            });
        } else {
            const noEventsLi = document.createElement("li");
            noEventsLi.className = "no-events";
            noEventsLi.innerHTML =
                'No upcoming events currently scheduled. Follow our <a href="https://www.instagram.com/conceivedconception/" target="_blank" rel="noopener">Instagram</a> for announcements!';
            upcomingList.appendChild(noEventsLi);
        }

        // Render previous events
        previousList.innerHTML = "";
        if (previousEvents.length > 0) {
            previousEvents.forEach(function (ev) {
                previousList.appendChild(ev.element);
            });
        } else {
            const noPreviousLi = document.createElement("li");
            noPreviousLi.className = "no-events";
            noPreviousLi.textContent = "No previous events.";
            previousList.appendChild(noPreviousLi);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", organizeEvents);
    } else {
        organizeEvents();
    }
})();
