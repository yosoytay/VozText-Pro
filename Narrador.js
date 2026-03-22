import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Play, Pause, Square, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// ARCHIVO: src/components/FileUploader.jsx
// ==========================================
const FileUploader = ({ onTextExtracted, onError }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = async (file) => {
        if (!file) return;

        // Validación de tipo de archivo
        const validTypes = ['text/plain', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            onError('Por favor, sube un archivo TXT o PDF válido.');
            return;
        }

        try {
            if (file.type === 'text/plain') {
                const text = await file.text();
                if (!text.trim()) throw new Error('El archivo de texto está vacío.');
                onTextExtracted(text);
            } else if (file.type === 'application/pdf') {
                // NOTA PARA TAY: En un entorno de producción, la extracción de PDF 
                // se maneja mejor en el backend (Node.js) con librerías como 'pdf-parse'
                // o en el frontend usando 'pdfjs-dist'. Para esta demo, simulamos la lectura.
                onError('Lectura nativa de PDF requiere backend. Prueba subiendo un archivo .txt por ahora.');
            }
        } catch (err) {
            onError('Error al leer el archivo: ' + err.message);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt,.pdf"
                onChange={handleFileInput}
            />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Arrastra tu archivo aquí</h3>
            <p className="mt-1 text-sm text-gray-500">o haz clic para buscar (TXT, PDF)</p>
        </div>
    );
};

// ==========================================
// ARCHIVO: src/components/TextInput.jsx
// ==========================================
const TextInput = ({ value, onChange }) => {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">
                    O pega tu texto directamente:
                </label>
                <span className="text-xs text-gray-400">{value.length} caracteres</span>
            </div>
            <textarea
                id="text-input"
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm"
                placeholder="Pega aquí el texto que deseas convertir a voz..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

// ==========================================
// ARCHIVO: src/components/AudioPlayer.jsx
// ==========================================
const AudioPlayer = ({ text, onError }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);

    // Limpieza al desmontar el componente
    useEffect(() => {
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const handlePlay = () => {
        if (!text.trim()) {
            onError('No hay texto para reproducir. Por favor, ingresa algún texto.');
            return;
        }

        // Si está pausado, simplemente reanudamos
        if (isPaused) {
            synthRef.current.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        // Si no está reproduciendo, creamos una nueva instancia
        synthRef.current.cancel(); // Detenemos cualquier audio previo
        const utterance = new SpeechSynthesisUtterance(text);

        // Configuramos la voz (intentamos buscar una voz en español)
        const voices = synthRef.current.getVoices();
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));
        if (spanishVoice) utterance.voice = spanishVoice;

        utterance.rate = 1.0; // Velocidad normal

        // Eventos para actualizar la interfaz
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = (e) => {
            console.error("Error en síntesis:", e);
            setIsPlaying(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
        setIsPlaying(true);
    };

    const handlePause = () => {
        if (synthRef.current.speaking) {
            synthRef.current.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        synthRef.current.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    const handleDownload = () => {
        // NOTA PARA TAY: La Web Speech API no permite descargar el audio directamente.
        // Para lograr esto en tu versión final (Marzo 2026), enviarás el texto a tu
        // backend en Node.js, allí llamarás a una API (ej. OpenAI TTS) y devolverás
        // un archivo .mp3 al frontend.
        onError('La descarga de MP3 estará disponible cuando integremos el backend en Node.js. ¡Por ahora escucha la vista previa gratuita!', 'info');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800">Motor TTS (Nativo)</h4>
                    <p className="text-xs text-gray-500">Costo: $0.00 (Ahorro activo)</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!isPlaying ? (
                    <button
                        onClick={handlePlay}
                        className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
                        title="Reproducir"
                    >
                        <Play size={20} className="ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md"
                        title="Pausar"
                    >
                        <Pause size={20} />
                    </button>
                )}

                <button
                    onClick={handleStop}
                    disabled={!isPlaying && !isPaused}
                    className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    title="Detener"
                >
                    <Square size={20} fill="currentColor" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-2"></div>

                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                    <Download size={16} />
                    <span>MP3</span>
                </button>
            </div>
        </div>
    );
};

// ==========================================
// ARCHIVO: src/App.jsx (Componente Principal)
// ==========================================
export default function App() {
    const [text, setText] = useState('');
    const [notification, setNotification] = useState(null);

    // Manejador de notificaciones (errores o info)
    const showNotification = (msg, type = 'error') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 5000); // Ocultar después de 5s
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Encabezado */}
                <header className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        VozText <span className="text-blue-600">Pro</span>
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Convierte tus documentos y notas en audio de forma rápida y accesible.
                    </p>
                </header>

                {/* Notificaciones */}
                {notification && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 transition-all ${notification.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                        }`}>
                        {notification.type === 'error' ? <AlertCircle size={20} className="mt-0.5" /> : <CheckCircle2 size={20} className="mt-0.5" />}
                        <p className="text-sm font-medium">{notification.msg}</p>
                    </div>
                )}

                {/* Contenido Principal */}
                <main className="bg-white shadow-xl shadow-gray-200/50 rounded-3xl p-6 sm:p-10 space-y-8">

                    {/* Módulo 1: Subida de Archivos */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Carga tu documento</h2>
                        <FileUploader
                            onTextExtracted={(extractedText) => {
                                setText(extractedText);
                                showNotification('¡Archivo cargado exitosamente!', 'info');
                            }}
                            onError={showNotification}
                        />
                    </section>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase">O</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Módulo 2: Portapapeles (TextArea) */}
                    <section>
                        <TextInput value={text} onChange={setText} />
                    </section>

                    {/* Módulo 3 y 4: Motor de Audio y Reproductor */}
                    <section className="pt-4 border-t border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Reproducción</h2>
                        <AudioPlayer text={text} onError={showNotification} />
                    </section>

                </main>

                <footer className="text-center text-sm text-gray-400">
                    Diseñado con enfoque reflexivo y arquitectura limpia.
                </footer>
            </div>
        </div>
    );
}