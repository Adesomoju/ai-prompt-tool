import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min?url';

GlobalWorkerOptions.workerSrc = workerUrl;