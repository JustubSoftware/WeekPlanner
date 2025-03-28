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
  
    // Definiere Farben und Stile
    const primaryColor = [47, 72, 88]; // Dunkelblau
    const secondaryColor = [228, 199, 188]; // Beige
    const textColor = [51, 51, 51]; // Dunkelgrau
    const titleFontSize = 18;
    const subtitleFontSize = 14;
    const textFontSize = 12;
    const padding = 10;
    let yOffset = 20;
    const pageHeight = doc.internal.pageSize.height;
  
    // Titel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleFontSize);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Wochenplan - KW ${this.week}`, padding, yOffset);
    yOffset += 10;
  
    doc.setFontSize(subtitleFontSize);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Kalenderwoche ${this.week}`, padding, yOffset);
    yOffset += 10;
  
    // Trennlinie
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(padding, yOffset, 200 - padding, yOffset);
    yOffset += 10;
  
    // Inhalte generieren
    this.weekDays.forEach((day) => {
      const activity = this.activities[day] || "Keine Aktivitäten für diesen Tag";
  
      // Prüfen, ob genug Platz auf der Seite ist, sonst neue Seite
      if (yOffset + 40 > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }
  
      // Wochentag hervorheben
      doc.setFont("helvetica", "bold");
      doc.setFontSize(subtitleFontSize);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(day, padding, yOffset);
      yOffset += 8;
  
      // Hintergrundbox für Aktivitäten mit abgerundeten Ecken
      const textLines = doc.splitTextToSize(activity, 170);
      const boxHeight = textLines.length * 6 + 10;
  
      if (yOffset + boxHeight > pageHeight - 20) {
        doc.addPage();
        yOffset = 20;
      }
  
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.roundedRect(padding - 2, yOffset, 180, boxHeight, 5, 5, "F");
  
      // Aktivitätstext
      doc.setFont("helvetica", "normal");
      doc.setFontSize(textFontSize);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(textLines, padding + 3, yOffset + 7);
  
      yOffset += boxHeight + 10;
    });
  
    // Footer
    if (yOffset + 20 > pageHeight - 10) {
      doc.addPage();
      yOffset = 20;
    }
    doc.setFontSize(textFontSize - 2);
    doc.setTextColor(176, 160, 176);
    doc.text(
      "Diese .pdf wurde auf weekplanner.justinbecker.de generiert.\nÄnderungsanträge können ebenfalls über diese Seite erstellt werden.",
      padding,
      yOffset
    );
  
    doc.save("wochenplan.pdf");
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

  saveWeekData() {
    const weekKey = `week_${this.week}`;
    localStorage.setItem(weekKey, JSON.stringify(this.activities));
  }
  
  loadWeekData() {
    const weekKey = `week_${this.week}`;
    const savedData = localStorage.getItem(weekKey);
    if (savedData) {
      this.activities = JSON.parse(savedData);
    } else {
      this.activities = {
        Montag: '', Dienstag: '', Mittwoch: '', Donnerstag: '', Freitag: '', Samstag: '', Sonntag: ''
      };
    }
  }
}
