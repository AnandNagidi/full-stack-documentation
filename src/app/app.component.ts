import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

interface DocItem {
  id: string;
  filename: string;
  title: string;
  icon: string;
}

interface TrackerData {
  [docId: string]: {
    status: ProgressStatus;
    lastVisited?: string;
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  documents: DocItem[] = [
    { id: '01', filename: '01-dotnet-core.md', title: '.NET Core / .NET 8', icon: '🟣' },
    { id: '02', filename: '02-csharp-advanced.md', title: 'C# Advanced', icon: '💜' },
    { id: '03', filename: '03-angular.md', title: 'Angular', icon: '🔴' },
    { id: '04', filename: '04-sql-server.md', title: 'SQL Server', icon: '🗄️' },
    { id: '05', filename: '05-microservices.md', title: 'Microservices', icon: '🔗' },
    { id: '06', filename: '06-oops-concepts.md', title: 'OOP Concepts', icon: '🧱' },
    { id: '07', filename: '07-solid-principles.md', title: 'SOLID Principles', icon: '📐' },
    { id: '08', filename: '08-design-patterns.md', title: 'Design Patterns', icon: '🏗️' },
    { id: '09', filename: '09-azure-cloud.md', title: 'Azure Cloud', icon: '☁️' },
    { id: '10', filename: '10-system-design.md', title: 'System Design', icon: '🏛️' },
    { id: '11', filename: '11-preparation-roadmap.md', title: 'Preparation Roadmap', icon: '🗺️' },
    { id: '12', filename: '12-quick-revision-notes.md', title: 'Quick Revision', icon: '⚡' },
    { id: '13', filename: '13-top-100-questions.md', title: 'Top 100 Questions', icon: '💯' },
    { id: '14', filename: '14-mock-interview-guide.md', title: 'Mock Interview', icon: '🎤' },
    { id: '15', filename: '15-ai-tools-and-agents.md', title: 'AI Tools & Agents', icon: '🤖' },
    { id: '16', filename: '16-entity-framework-core.md', title: 'Entity Framework', icon: '🔌' },
  ];

  private readonly STORAGE_KEY = 'interview-prep-tracker';

  selectedDoc = signal<DocItem | null>(null);
  rawContent = signal<string>('');
  renderedHtml = signal<SafeHtml>('');
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  matchCount = signal<number>(0);
  tracker = signal<TrackerData>({});

  // Computed stats
  completedCount = computed(() => {
    const t = this.tracker();
    return Object.values(t).filter(v => v.status === 'completed').length;
  });

  inProgressCount = computed(() => {
    const t = this.tracker();
    return Object.values(t).filter(v => v.status === 'in-progress').length;
  });

  overallProgress = computed(() => {
    return Math.round((this.completedCount() / this.documents.length) * 100);
  });

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadTracker();
  }

  getStatus(docId: string): ProgressStatus {
    return this.tracker()[docId]?.status || 'not-started';
  }

  getLastVisited(docId: string): string | null {
    return this.tracker()[docId]?.lastVisited || null;
  }

  cycleStatus(event: Event, docId: string): void {
    event.stopPropagation();
    const current = this.getStatus(docId);
    const next: ProgressStatus =
      current === 'not-started' ? 'in-progress' :
      current === 'in-progress' ? 'completed' : 'not-started';

    this.updateStatus(docId, next);
  }

  markAsStatus(status: ProgressStatus): void {
    const doc = this.selectedDoc();
    if (doc) {
      this.updateStatus(doc.id, status);
    }
  }

  selectDocument(doc: DocItem): void {
    this.selectedDoc.set(doc);
    this.isLoading.set(true);
    this.searchTerm.set('');
    this.matchCount.set(0);

    // Update last visited
    const t = { ...this.tracker() };
    if (!t[doc.id]) t[doc.id] = { status: 'not-started' };
    t[doc.id].lastVisited = new Date().toISOString();
    // Auto-mark as in-progress if not started
    if (t[doc.id].status === 'not-started') {
      t[doc.id].status = 'in-progress';
    }
    this.tracker.set(t);
    this.saveTracker();

    this.http.get(`docs/${doc.filename}`, { responseType: 'text' }).subscribe({
      next: (content) => {
        this.rawContent.set(content);
        this.renderMarkdown(content);
        this.isLoading.set(false);
      },
      error: () => {
        this.rawContent.set('Failed to load document.');
        this.renderedHtml.set('Failed to load document.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.selectedDoc.set(null);
    this.rawContent.set('');
    this.renderedHtml.set('');
    this.searchTerm.set('');
    this.matchCount.set(0);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    if (!term.trim()) {
      this.renderMarkdown(this.rawContent());
      this.matchCount.set(0);
      return;
    }
    this.highlightSearch(term);
  }

  resetTracker(): void {
    if (confirm('Reset all progress? This cannot be undone.')) {
      this.tracker.set({});
      this.saveTracker();
    }
  }

  private updateStatus(docId: string, status: ProgressStatus): void {
    const t = { ...this.tracker() };
    if (!t[docId]) t[docId] = { status: 'not-started' };
    t[docId].status = status;
    this.tracker.set(t);
    this.saveTracker();
  }

  private loadTracker(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.tracker.set(JSON.parse(stored));
      }
    } catch { /* ignore parse errors */ }
  }

  private saveTracker(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tracker()));
  }

  private renderMarkdown(content: string): void {
    const html = marked.parse(content) as string;
    this.renderedHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }

  private highlightSearch(term: string): void {
    const html = marked.parse(this.rawContent()) as string;
    const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
    const matches = html.match(regex);
    this.matchCount.set(matches ? matches.length : 0);
    const highlighted = html.replace(regex, '<mark class="search-highlight">$1</mark>');
    this.renderedHtml.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));

    setTimeout(() => {
      const firstMatch = document.querySelector('.search-highlight');
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
