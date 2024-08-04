import React, { useMemo, useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import * as dates from "../../utils/dates";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../utils/toolBar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import useWeeklyPlanner from "../../hooks/mainApp/useWeeklyPlanner";
import useRecipe from "../../hooks/mainApp/useRecipe";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const WeeklyPlanner = () => {
    const getAuthState = () => {
        // Obtener el valor de la cookie por su nombre
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("_auth_state="))
            ?.split("=")[1];

        if (!cookieValue) {
            return null;
        }

        // Decodificar el valor URL-encoded de la cookie y parsearlo como JSON
        try {
            const decodedValue = decodeURIComponent(cookieValue);
            const authState = JSON.parse(decodedValue);
            return authState;
        } catch (error) {
            console.error("Error parsing auth state:", error);
            return null;
        }
    };
    const userData = getAuthState();

    // Estados
    const [selectedDate, setSelectedDate] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [search, setSearch] = useState("");

    // Hooks
    const { getAllEvents, postSaveCalendar } = useWeeklyPlanner();
    const { getUserRecipesWeeklyPlanner } = useRecipe();

    const { components, defaultDate, max, views } = useMemo(
        () => ({
            defaultDate: new Date(),
            max: dates.add(dates.endOf(new Date(), "day"), -1, "hours"),
            views: [Views.WEEK],
        }),
        [selectedDate]
    );

    // Hecho asi para que useMemo no provoque el refetch continuo de la query
    const fetchUserRecipes = useCallback(() => {
        return getUserRecipesWeeklyPlanner(userData?.email, search);
    }, [userData?.email, search]);

    // Obtener todos los eventos
    const {
        data: foundRecipes,
        isLoading: loadfoundRecipes,
        refetch,
    } = useQuery({
        queryKey: ["weekly-planner"],
        queryFn: fetchUserRecipes,
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    // Obtener los eventos del usuario
    /*useEffect(() => {
        if (Array.isArray(foundRecipes)) {
            setMyEvents(foundRecipes);
        } else {
            setMyEvents([]);
        }
    }, [foundRecipes]);*/

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
        const recipeIds = eventsOnSelectedDay.map((event) => event.recipeID);
        // Mostrar los recipeId en la consola
        console.log("Recipe IDs on selected day:", recipeIds);
    };

    // Drag and Drop
    const handleEventDrop = ({ event, start, end }) => {
        if (moment(start).isSame(end, "day")) {
            const updatedEvents = myEvents.map((evt) => {
                if (evt.eventID === event.eventID) {
                    return { ...cleanEvent(event), start, end };
                }
                return evt;
            });
            setMyEvents(updatedEvents);
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
                if (evt.eventID === event.eventID) {
                    return { ...cleanEvent(event), start, end };
                }
                return evt;
            });
            setMyEvents(updatedEvents);
        } else {
            console.log(
                "Error: El evento debe empezar y terminar en el mismo día."
            );
        }
    };

    // Drag and drop outside calendar
    const handleDragStart = useCallback((event) => {
        // Crear un nuevo ID único usando uuid
        const newID = uuidv4(); // Esto generará un UUID único
    
        // Configurar el evento arrastrado con el nuevo ID
        setDraggedEvent({
            ...event,
            eventID: newID,
        });
    }, []);    

    const onDropFromOutside = useCallback(
        ({ start, end, allDay }) => {
            if (!draggedEvent) return;

            const eventWithNewID = {
                ...cleanEvent(draggedEvent),
                start,
                end,
            };

            setMyEvents((prevEvents) => [...prevEvents, eventWithNewID]);
            setDraggedEvent(null);
        },
        [draggedEvent]
    );

    const dayPropGetter = (date) => {
        if (selectedDate && moment(date).isSame(selectedDate, "day")) {
            return {
                style: {
                    backgroundColor: "lightblue", // Cambia el color de fondo del día seleccionado
                },
            };
        }
    };

    // Realizar búsqueda por nombre al pulsar el intro
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            refetch();
        }
    };

    // Función para cambiar valor de la barra de búsqueda
    const handleChange = (event) => {
        setSearch(event.target.value);
    };

    // Función para dejar en el evento solamente la información necesaria
    const cleanEvent = (event) => ({
        eventID: event.eventID,
        recipeID: event.recipeID || event.id,
        title: event.title,
        start: event.start,
        end: event.end,
    });

    // Guardar el estado actual del calendario
    const handleSaveChanges = () => {
        postSaveCalendar.mutate(
            { email: userData.email, myEvents: myEvents },
            {
                onSuccess: (data) => {
                    if (data.success) {
                        toast.success("Save successfully!");
                    } else {
                        toast.error(`An error occurred while saving calendar.`);
                    }
                },
                onError: (error) => {
                    toast.error(
                        `An error occurred while saving calendar: ${error.message}`
                    );
                },
            }
        );
    };

    // Mensaje de cargando datos de eventos
    if (loadfoundRecipes) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">
                    Loading Calendar...{" "}
                </h1>
            </div>
        );
    }

    return (
        <>
            <>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
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
                                        events={
                                            Array.isArray(myEvents)
                                                ? myEvents
                                                : []
                                        }
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
                                    <button
                                        className="px-4 py-2  text-2xl bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                                        onClick={handleSaveChanges}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col overflow-y-auto h-[85.5vh] p-4 rounded-xl border-slate-700 bg-slate-700">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Your Recipes..."
                                    className="text-center py-1 bg-slate-500 rounded-md border-2 border-gray-300 text-xl text-white placeholder:text-gray-300"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(foundRecipes) &&
                                        foundRecipes.map((event) => (
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
