const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de multer para la subida de archivos (se guarda en 'uploads/')
const upload = multer({ dest: 'uploads/' });

// API: Subir archivo y extraer texto
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const filePath = req.file.path;
        let extractedText = '';

        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (req.file.mimetype === 'text/plain') {
            extractedText = fs.readFileSync(filePath, 'utf8');
        } else {
            // Eliminar archivo si no es soportado
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Formato no soportado. Por favor sube un PDF o TXT.' });
        }

        // Limpieza del archivo temporal
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (!extractedText || !extractedText.trim()) {
            return res.status(400).json({ error: 'El archivo está vacío o no contiene texto legible.' });
        }

        res.json({ text: extractedText.trim() });
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ error: 'Ocurrió un error extrayendo el texto del archivo.' });
    }
});

// API: Convertir texto a audio (TTS)
app.post('/api/tts', (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Se requiere texto para convertir a audio.' });
    }

    try {
        const audioDir = path.join(__dirname, 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir);
        }

        const fileName = `audio-${Date.now()}.mp3`;
        const filePath = path.join(audioDir, fileName);

        // Usar gtts para generar el archivo de voz (en español)
        const gtts = new gTTS(text, 'es');
        
        gtts.save(filePath, function (err, result) {
            if (err) {
                console.error('Error en gTTS:', err);
                return res.status(500).json({ error: 'Error al generar el audio sintético.' });
            }

            // Descargar y limpiar el archivo una vez finalizado
            res.download(filePath, 'voztext-audio.mp3', (downloadErr) => {
                if (downloadErr) {
                    console.error('Error descargando archivo:', downloadErr);
                }
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        });
    } catch (error) {
        console.error('Error general en TTS:', error);
        res.status(500).json({ error: 'Error interno del servidor en la conversión de audio.' });
    }
});

// Archivos estáticos del frontend (Vue build)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend de VozText Pro corriendo en http://localhost:${PORT}`);
});

// Ruta catch-all para Vue Router o acceso directo
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
