import React, { useMemo, useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import * as dates from "../../utils/dates";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../utils/toolBar.css";
import moment from "moment-timezone";
import "moment/locale/es";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import useWeeklyPlanner from "../../hooks/mainApp/useWeeklyPlanner";
import useRecipe from "../../hooks/mainApp/useRecipe";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import fondoPizarra from "/fondoPizarra.png";
import { PieChart } from "react-minimal-pie-chart";

moment.locale("es");
moment.updateLocale("es", {
    week: {
        dow: 1, // Lunes es el primer día de la semana
    },
});

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const minTime = new Date();
minTime.setHours(8, 0, 0);

const maxTime = new Date();
maxTime.setHours(23, 0, 0);

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
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    // Recetas del usuario filtradas por nombre
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

    // Recetas del usuario filtradas por nombre
    const { data: userEvents, isLoading: loadUserEvents } = useQuery({
        queryKey: [],
        queryFn: getAllEvents,
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    //Obtener los eventos del usuario
    useEffect(() => {
        if (Array.isArray(userEvents)) {
            setMyEvents(userEvents);
        } else {
            setMyEvents([]);
        }
    }, [userEvents]);

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

    // Dispara el evento de handleDeleteEvent en caso de pulsar "suprimir"
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Comprobar si la tecla presionada es 'Delete' y si hay un evento seleccionado
            if (e.key === "Delete" && selectedEvent) {
                handleDeleteEvent(selectedEvent.eventID);
                setSelectedEvent(null);
            }
        };

        // Agregar el listener de evento al documento
        document.addEventListener("keydown", handleKeyDown);

        // Limpiar el listener cuando el componente se desmonta
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedEvent]);

    // Elimina evento
    const handleDeleteEvent = (eventID) => {
        const updatedEvents = myEvents.filter(
            (event) => event.eventID !== eventID
        );
        setMyEvents(updatedEvents);
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

    // Selecciona un evento
    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    // Borra todos los eventos del calendario
    const handleClearCalendar = () => {
        setMyEvents([]);
        toast.info("All events have been cleared from the calendar.");
    };

    // Mensaje de cargando datos de eventos
    if (loadfoundRecipes || loadUserEvents) {
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
                        <div
                            className="flex rounded-xl border-slate-700 bg-slate-700 flex-col"
                        >
                            <div className="rounded-xl border-slate-700 flex flex-col h-full">
                                <div className="flex-grow p-3">
                                    <DnDCalendar
                                        onSelectEvent={handleSelectEvent}
                                        components={components}
                                        defaultDate={defaultDate}
                                        defaultView={Views.WEEK}
                                        events={
                                            Array.isArray(myEvents)
                                                ? myEvents
                                                : []
                                        }
                                        localizer={localizer}
                                        min={minTime}
                                        max={maxTime}
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
                                <div className="h-1/3 p-4 rounded-b-xl grid grid-cols-[4fr,5fr] gap-4">
                                    <div className="flex justify-around items-center">
                                        <button
                                            className="mb-7 px-4 py-2 h-1/4 text-2xl bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                                            onClick={handleSaveChanges}
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            className="mb-7 px-4 py-2 h-1/4 text-2xl bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
                                            onClick={handleClearCalendar}
                                        >
                                            Clear Calendar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div
                                            className="grid grid-cols-2 items-center text-center h-3/6 mt-7"
                                            style={{ width: "100%" }}
                                        >
                                            <div>
                                                <p className="font-semibold text-xl mb-3 text-white">
                                                    Calories:
                                                </p>
                                                <p className="font-semibold text-xl mb-3 text-white">
                                                    3 Kcal
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#ecac4c" }}
                                                >
                                                    Fat:
                                                </p>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#ecac4c" }}
                                                >
                                                    3 g
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#dd4f4a" }}
                                                >
                                                    Protein:
                                                </p>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#dd4f4a" }}
                                                >
                                                    3 g
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#f3ea66" }}
                                                >
                                                    Carbohydrates:
                                                </p>
                                                <p
                                                    className="font-semibold text-xl mb-3"
                                                    style={{ color: "#f3ea66" }}
                                                >
                                                    3 g
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-4 ml-16 justify-center h-3/5 w-3/5">
                                            <PieChart
                                            radius={50}
                                            center={[50, 50]}
                                            viewBoxSize={[100,100]}
                                            lineWidth={65}
                                            animate={true}
                                            animationDuration={1400}
                                            animationEasing="ease-out"
                                            data={[
                                                {
                                                    title: "Fat",
                                                    value: 1,
                                                    color: "#ecac4c",
                                                },
                                                {
                                                    title: "Protein",
                                                    value: 2,
                                                    color: "#dd4f4a",
                                                },
                                                {
                                                    title: "Carbohydrate",
                                                    value: 3,
                                                    color: "#f3ea66",
                                                },
                                            ]}
                                            label={({ dataEntry }) =>
                                                `${Math.round(dataEntry.percentage)}%`
                                            }
                                            labelStyle={{
                                                fontSize: "9px",
                                                fontFamily: "sans-serif",
                                                fontWeight: 'bold',
                                                fill: "#000000", 
                                                
                                            }}
                                            labelPosition={65}/>
                                        </div>
                                    </div>
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
