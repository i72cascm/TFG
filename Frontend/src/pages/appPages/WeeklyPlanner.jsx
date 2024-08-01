import React, { useMemo } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import * as dates from "../../utils/dates";
import events from "../../utils/events";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../utils/toolBar.css";
import moment from "moment";

const localizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children }) =>
    React.cloneElement(React.Children.only(children), {
        style: {
            backgroundColor: "lightblue",
        },
    });

const WeeklyPlanner = () => {
    const { components, defaultDate, max, views } = useMemo(
        () => ({
            components: {
                timeSlotWrapper: ColoredDateCellWrapper,
            },
            defaultDate: new Date(2015, 3, 1),
            max: dates.add(
                dates.endOf(new Date(2015, 17, 1), "day"),
                -1,
                "hours"
            ),
            views:[Views.WEEK],
        }),
        []
    );
    return (
        <>
            <>
                <div className="min-w-[1000px] overflow-x-auto">
                    <div className="flex justify-center mt-2 mb-7">
                        <h1 className="text-sky-600 font-black text-7xl col-span-2 capitalize">
                            Weekly{" "}
                            <span style={{ color: "#00ADB5" }}>planner</span>
                        </h1>
                    </div>
                    <div className="grid grid-cols-[4fr,1fr] gap-4 mx-4">
                        <div className="flex rounded-xl border-slate-700 bg-slate-700 flex-col">
                            <div className="rounded-xl border-slate-700 bg-slate-700 flex flex-col h-full">
                                <div className="flex-grow p-3">
                                    <Calendar
                                        components={components}
                                        defaultDate={defaultDate}
                                        defaultView={Views.WEEK}
                                        events={events}
                                        localizer={localizer}
                                        max={max}
                                        showMultiDayTimes
                                        step={60}
                                        views={views}
                                    />
                                </div>
                                <div className="h-1/4 mt-4 p-4 bg-slate-600 rounded-b-xl">
                                    A
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col overflow-y-auto h-[85.5vh] p-4 rounded-xl border-slate-700 bg-slate-700">
                                <input
                                    type="text"
                                    placeholder="Your Recipes..."
                                    className="text-center py-1 bg-slate-500 rounded-md border-2 border-gray-300 text-xl text-white placeholder:text-gray-300"
                                />
                                <div className="flex flex-wrap gap-2">bb</div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </>
    );
};

export default WeeklyPlanner;
