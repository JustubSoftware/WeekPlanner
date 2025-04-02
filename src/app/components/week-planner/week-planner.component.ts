import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-week-planner',
  standalone: false,
  templateUrl: './week-planner.component.html',
  styleUrls: ['./week-planner.component.css']
})
export class WeekPlannerComponent implements OnInit{
  week: number = this.getCurrentWeek();
  currentWeek: number = this.getCurrentWeek(); 
  weekDays: string[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  activities: { [key: string]: string } = {
    Montag: '', Dienstag: '', Mittwoch: '', Donnerstag: '', Freitag: '', Samstag: '', Sonntag: ''
  };

  notes: string = ""; 
  pdfFileName: string = 'Wochenplan.pdf';


  ngOnInit() {
    this.loadWeekData();
  }
  

  getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
  }

  generatePDF() {
    const doc = new jsPDF();
    let yOffset = 20;
    const padding = 10;
    const pageHeight = doc.internal.pageSize.height;

    const headerColor = '#2f4858'; // Originalfarbe für Header
    const dayBoxColor = '#e4c7bc'; // Originalfarbe für Tagesboxen
    const backgroundColor = '#FFE5E7'; // Originalfarbe für Hintergrund
    const textColor = '#2f4858'; // Originalfarbe für Text
    const notesBoxColor = '#e4c7bc'; // Originalfarbe für Notizenbox

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.text(`Wochenplan - KW ${this.week}`, padding, yOffset);
    yOffset += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text(`Kalenderwoche ${this.week}`, padding, yOffset);
    yOffset += 10;

    doc.line(padding, yOffset, 200 - padding, yOffset);
    yOffset += 10;

    // 📆 Aktivitäten je Wochentag
    this.weekDays.forEach((day) => {
      const activity = this.activities[day] || "Keine Aktivitäten für diesen Tag";

      if (yOffset + 40 > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(textColor);
      doc.text(day, padding, yOffset);
      yOffset += 8;

      const textLines = doc.splitTextToSize(activity, 170);
      const boxHeight = textLines.length * 6 + 10;

      if (yOffset + boxHeight > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFillColor(...this.hexToRgbArray(dayBoxColor)); // Farbe der Tagesboxen
      doc.roundedRect(padding - 2, yOffset, 180, boxHeight, 5, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text(textLines, padding + 3, yOffset + 7);
      yOffset += boxHeight + 10;
    });

    // 📝 Notizen-Abschnitt
    if (this.notes.trim() !== "") {
      if (yOffset + 30 > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(textColor);
      doc.text("Zusätzliche Notizen", padding, yOffset);
      yOffset += 8;

      const textLines = doc.splitTextToSize(this.notes, 170);
      const boxHeight = textLines.length * 6 + 10;

      if (yOffset + boxHeight > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFillColor(...this.hexToRgbArray(notesBoxColor)); // Farbe der Notizenbox
      doc.roundedRect(padding - 2, yOffset, 180, boxHeight, 5, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text(textLines, padding + 3, yOffset + 7);
      yOffset += boxHeight + 10;
    }

    doc.save("wochenplan.pdf");
  }

  // Hilfsmethode, um hex Farben in RGB umzuwandeln
  hexToRgbArray(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b]; // Gebe ein Tupel zurück
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Höhe zurücksetzen, um die neue Höhe zu berechnen
    textarea.style.height = `${textarea.scrollHeight}px`; // Höhe an den Inhalt anpassen
    this.saveWeekData();
  }

  openMailWithText(): void {
    const email = '';
    const subject = `Wochenplan für KW ${this.week}`;
    const body = encodeURIComponent(`Guten Tag, anbei meine Wochenplanung für Kalenderwoche ${this.week} als PDF-Datei.\n
      \n
      Mit freundlichen Grüßen`); // Body der E-Mail
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;  // Öffnet den Standard-E-Mail-Client
  }

  sendChangeRequestEmail() {
    const subject = `Änderungsantrag Wochenplan KW ${this.week}`;
    const body = `Hallo Leonie,\n\nich möchte einen Änderungsantrag für den Wochenplan KW ${this.week} stellen. Hier sind meine Änderungen:\n\n`;

    // Konstruieren des mailto-Links mit CC
    const mailtoLink = `mailto:leonie.kozevnikov.1506@gmail.com?cc=mail@justinbecker.de&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Öffnen des Mail-Postfachs
    window.location.href = mailtoLink;
  }

  prevWeek() {
    if (this.week > 1) {
      this.saveWeekData();
      this.week--;
      this.loadWeekData();
    }
  }
  
  nextWeek() {
    if (this.week < 53) {
      this.saveWeekData();
      this.week++;
      this.loadWeekData();
    }
  }

  saveWeekData(): void {
    const weekKey = `week_${this.week}`;
    localStorage.setItem(weekKey, JSON.stringify(this.activities));

    const notesKey = `notes_week_${this.week}`;
    localStorage.setItem(notesKey, this.notes);
  }
  
  loadWeekData(): void {
    const weekKey = `week_${this.week}`;
    const savedData = localStorage.getItem(weekKey);

    if (savedData) {
      this.activities = JSON.parse(savedData);
    } else {
      this.activities = {
        Montag: '', Dienstag: '', Mittwoch: '', Donnerstag: '', Freitag: '', Samstag: '', Sonntag: ''
      };
    }

    // Laden der Notizen aus dem localStorage
    const notesKey = `notes_week_${this.week}`;
    const savedNotes = localStorage.getItem(notesKey);

    if (savedNotes) {
      this.notes = savedNotes;
    } else {
      this.notes = "";  // Setze leere Notizen, wenn nichts gespeichert wurde
    }
  }
}
