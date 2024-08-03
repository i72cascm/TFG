import React, { useMemo, useState, useCallback } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import * as dates from "../../utils/dates";
import events from "../../utils/events";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../utils/toolBar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const WeeklyPlanner = () => {
    // Estados
    const [selectedDate, setSelectedDate] = useState(null);
    const [myEvents, setMyEvents] = useState(events);
    const [draggedEvent, setDraggedEvent] = useState(null);

    const { components, defaultDate, max, views } = useMemo(
        () => ({
            defaultDate: new Date(),
            max: dates.add(dates.endOf(new Date(), "day"), -1, "hours"),
            views: [Views.WEEK],
        }),
        [selectedDate]
    );

    // Selección de un día y obtención de las recetas en dicho día
    const handleDaySelect = (slotInfo) => {
        console.log("Selected date:", slotInfo.start.toLocaleDateString());
        // Establecer la fecha seleccionada
        setSelectedDate(slotInfo.start);
        // Filtrar eventos que ocurren en el día seleccionado
        const eventsOnSelectedDay = myEvents.filter((event) =>
            moment(event.start).isSame(slotInfo.start, "day")
        );
        // Obtener los recipeId de los eventos del día seleccionado
        const recipeIds = eventsOnSelectedDay.map((event) => event.recipeId);
        // Mostrar los recipeId en la consola
        console.log("Recipe IDs on selected day:", recipeIds);
    };

    // Drag and Drop
    const handleEventDrop = ({ event, start, end }) => {
        if (moment(start).isSame(end, "day")) {
            const updatedEvents = myEvents.map((evt) => {
                if (evt.id === event.id) {
                    return { ...evt, start, end };
                }
                return evt;
            });
            setMyEvents(updatedEvents);
            console.log("Evento movido:", event.title, start, end);
        } else {
            console.log(
                "Error: El evento debe empezar y terminar en el mismo día."
            );
        }
    };

    // Redimensionar
    const handleEventResize = ({ event, start, end }) => {
        if (moment(start).isSame(end, "day")) {
            const updatedEvents = myEvents.map((evt) => {
                if (evt.id === event.id) {
                    return { ...evt, start, end };
                }
                return evt;
            });
            setMyEvents(updatedEvents);
            console.log("Evento redimensionado:", event.title, start, end);
        } else {
            console.log(
                "Error: El evento debe empezar y terminar en el mismo día."
            );
        }
    };

    // Drag and drop outside calendar
    const handleDragStart = useCallback((event) => {
        setDraggedEvent(event);
    }, []);

    const onDropFromOutside = useCallback(({ start, end, allDay }) => {
        const event = { ...draggedEvent, start, end, allDay };
        setMyEvents((prevEvents) => [...prevEvents, event]);
        setDraggedEvent(null);
    }, [draggedEvent]);

    const dayPropGetter = (date) => {
        if (selectedDate && moment(date).isSame(selectedDate, "day")) {
            return {
                style: {
                    backgroundColor: "lightblue", // Cambia el color de fondo del día seleccionado
                },
            };
        }
    };

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
                                    <DnDCalendar
                                        components={components}
                                        defaultDate={defaultDate}
                                        defaultView={Views.WEEK}
                                        events={myEvents}
                                        localizer={localizer}
                                        max={max}
                                        selectable
                                        onSelectSlot={handleDaySelect}
                                        onEventDrop={handleEventDrop}
                                        onEventResize={handleEventResize}
                                        onDropFromOutside={onDropFromOutside}
                                        draggableAccessor={(event) => true}
                                        resizableAccessor={(event) => true}
                                        showMultiDayTimes
                                        step={60}
                                        views={views}
                                        dayPropGetter={dayPropGetter}
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
                                <div className="flex flex-wrap gap-2">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            draggable
                                            onDragStart={() =>
                                                handleDragStart(event)
                                            }
                                            className="p-2 bg-gray-200 rounded cursor-pointer"
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </>
    );
};

export default WeeklyPlanner;
