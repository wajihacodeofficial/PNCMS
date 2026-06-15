import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

let logStream: fs.WriteStream | null = null;

function getLogStream() {
  if (logStream) return logStream;
  try {
    const logDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, 'app.log');
    logStream = fs.createWriteStream(logFile, { flags: 'a' });
    return logStream;
  } catch (e) {
    console.error('Failed to initialize file logger:', e);
    return null;
  }
}

function formatMsg(level: string, msg: string, ...args: any[]) {
  const ts = new Date().toISOString();
  let text = `[${ts}] [${level}] ${msg}`;
  if (args.length > 0) {
    text += ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  }
  return text + '\n';
}

function writeLog(level: string, msg: string, ...args: any[]) {
  const text = formatMsg(level, msg, ...args);
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    if (level === 'ERROR') console.error(text.trim());
    else if (level === 'WARN') console.warn(text.trim());
    else console.log(text.trim());
  }
  const stream = getLogStream();
  if (stream) {
    stream.write(text);
  }
}

export const logger = {
  info: (msg: string, ...args: any[]) => writeLog('INFO', msg, ...args),
  warn: (msg: string, ...args: any[]) => writeLog('WARN', msg, ...args),
  error: (msg: string, ...args: any[]) => writeLog('ERROR', msg, ...args),
  debug: (msg: string, ...args: any[]) => writeLog('DEBUG', msg, ...args),
};
