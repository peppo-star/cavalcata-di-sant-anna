'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Maximize2,
  Pause,
  Play,
  Radio,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CavalcataMap } from '@/components/cavalcata-map';
import { segments } from '@/lib/stages';

const DEMO_TICK_MS = 800;
const DEMO_DURATION_MS = 8 * 60 * 1000;
const DEMO_PROGRESS_STEP = DEMO_TICK_MS / DEMO_DURATION_MS;

function segmentAtProgress(progress: number) {
  const index = segments.findIndex((segment) => progress <= segment.end);
  return index < 0 ? segments.length - 1 : index;
}

function demoDurationLabel(speed: number) {
  const seconds = Math.round(DEMO_DURATION_MS / 1000 / speed);
  if (seconds < 90) return `${seconds} secondi`;

  const minutes = seconds / 60;
  const formattedMinutes = Number.isInteger(minutes)
    ? minutes.toString()
    : minutes.toFixed(1).replace('.', ',');
  return `circa ${formattedMinutes} minuti`;
}

export default function Home() {
  const mapSectionRef = useRef<HTMLElement>(null);
  const segmentTabsRef = useRef<HTMLElement>(null);
  const liveIndexRef = useRef(0);
  const [progress, setProgress] = useState(0.005);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [mapFocusRequestId, setMapFocusRequestId] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [mapIsMainView, setMapIsMainView] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  const liveIndex = segmentAtProgress(progress);
  const liveSegment = segments[liveIndex];
  const displayedSegment = segments[displayedIndex];
  const percentage = Math.round(progress * 100);

  liveIndexRef.current = liveIndex;

  useEffect(() => {
    if (!simulationRunning) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const nextProgress = current + DEMO_PROGRESS_STEP * demoSpeed;
        return nextProgress >= 1 ? 0.002 : nextProgress;
      });
    }, DEMO_TICK_MS);

    return () => window.clearInterval(timer);
  }, [demoSpeed, simulationRunning]);

  useEffect(() => {
    if (autoFollow) setDisplayedIndex(liveIndex);
  }, [autoFollow, liveIndex]);

  useEffect(() => {
    const section = mapSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isMainView = entry.isIntersecting && entry.intersectionRatio >= 0.58;
        setMapIsMainView(isMainView);
        setAutoFollow(isMainView);
        if (isMainView) setDisplayedIndex(liveIndexRef.current);
      },
      { threshold: [0, 0.58, 1] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `#${displayedSegment.id}`);
  }, [displayedSegment.id]);

  useEffect(() => {
    if (!mapInteractive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeInteractiveMap();
    };
    window.addEventListener('keydown', closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [mapInteractive]);

  useEffect(() => {
    const rail = segmentTabsRef.current;
    const activeTab = rail?.querySelector<HTMLElement>(
      `[data-segment-index="${displayedIndex}"]`,
    );
    if (!rail || !activeTab) return;

    const railBox = rail.getBoundingClientRect();
    const tabBox = activeTab.getBoundingClientRect();
    const safeInset = 18;

    if (tabBox.left < railBox.left + safeInset) {
      rail.scrollBy({
        left: tabBox.left - railBox.left - safeInset,
        behavior: 'smooth',
      });
    } else if (tabBox.right > railBox.right - safeInset) {
      rail.scrollBy({
        left: tabBox.right - railBox.right + safeInset,
        behavior: 'smooth',
      });
    }
  }, [displayedIndex]);

  function returnToLive() {
    setAutoFollow(true);
    setDisplayedIndex(liveIndexRef.current);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSegment(index: number) {
    setAutoFollow(false);
    setDisplayedIndex(index);
  }

  function openInteractiveMap() {
    setAutoFollow(true);
    setMapInteractive(true);
  }

  function closeInteractiveMap() {
    setMapInteractive(false);
    window.requestAnimationFrame(() => {
      document.getElementById('racconto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function exploreStageFromMap(index: number) {
    setAutoFollow(false);
    setDisplayedIndex(index);
    setMapInteractive(false);
    window.requestAnimationFrame(() => {
      document.getElementById('racconto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function jumpToStage(index: number) {
    const stageProgress = index === 0
      ? 0.005
      : Math.min(0.9995, segments[index - 1].end + 0.0001);

    setSimulationRunning(false);
    setAutoFollow(true);
    setDisplayedIndex(index);
    setProgress(stageProgress);
    setMapFocusRequestId((current) => current + 1);
  }

  const isOutOfSync = !autoFollow && displayedIndex !== liveIndex;

  return (
    <main>
      <section
        ref={mapSectionRef}
        className={`map-screen ${mapInteractive ? 'map-screen-interactive' : ''}`}
        aria-labelledby="page-title"
      >
        <div className="map-canvas">
          <CavalcataMap
            progress={progress}
            activeStageIndex={liveIndex}
            focusRequestId={mapFocusRequestId}
            followPosition={mapInteractive}
            interactive={mapInteractive}
            onExploreStage={exploreStageFromMap}
          />
        </div>

        <div className="map-overlay" aria-hidden="true" />

        <div className="demo-controls" aria-label="Controlli temporanei della simulazione">
          <label className="demo-speed-control">
            <span className="demo-speed-heading">
              <span>Velocità demo <small>temporanea</small></span>
              <output>{demoSpeed.toLocaleString('it-IT', { maximumFractionDigits: 2 })}×</output>
            </span>
            <input
              type="range"
              min="0.25"
              max="10"
              step="0.25"
              value={demoSpeed}
              aria-label="Regola la velocità della simulazione"
              onChange={(event) => setDemoSpeed(Number(event.target.value))}
            />
          </label>

          <label className="demo-stage-control">
            <span>Vai a una tappa</span>
            <select
              value={liveIndex}
              onChange={(event) => jumpToStage(Number(event.target.value))}
            >
              {segments.map((segment, index) => (
                <option key={segment.id} value={index}>{segment.shortName}</option>
              ))}
            </select>
          </label>
        </div>

        {!mapInteractive && (
          <button
            className="map-interaction-gate"
            type="button"
            aria-label="Apri la mappa interattiva a tutto schermo"
            onClick={openInteractiveMap}
          >
            <span><Maximize2 aria-hidden="true" /> Tocca per esplorare la mappa</span>
          </button>
        )}

        <header className="event-header">
          <button
            className={`home-link ${mapInteractive ? 'is-active' : ''}`}
            type="button"
            aria-label={mapInteractive ? 'Torna al racconto' : 'Pagina iniziale non ancora disponibile'}
            disabled={!mapInteractive}
            onClick={closeInteractiveMap}
          >
            <ArrowLeft aria-hidden="true" />
          </button>
          <div>
            <p>Comune di San Mango sul Calore</p>
            <h1 id="page-title">Cavalcata di Sant’Anna</h1>
          </div>
        </header>

        <aside className="live-panel" aria-label="Posizione della Cavalcata in diretta" aria-live="polite">
          <p className="section-label">La Cavalcata si trova a</p>
          <h2>{liveSegment.title}</h2>
          <div className="progress-line" aria-label={`Percorso completato al ${percentage} percento`}>
            <span style={{ width: `${percentage}%` }} />
          </div>
          <div className="progress-meta">
            <span>Durata demo: {demoDurationLabel(demoSpeed)}</span>
            <strong>{percentage}%</strong>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="pause-button"
            onClick={() => setSimulationRunning((current) => !current)}
          >
            {simulationRunning ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
            {simulationRunning ? 'Metti in pausa la demo' : 'Riprendi la demo'}
          </Button>
        </aside>

        <a className="scroll-hint" href="#racconto">
          <span>Scorri per scoprire il percorso</span>
          <ChevronDown aria-hidden="true" />
        </a>
      </section>

      <section className="story-section" id="racconto" aria-labelledby="story-title">
        <div className="story-inner">
          {isOutOfSync && (
            <div className="live-notice" role="status">
              <div>
                <span>La Cavalcata è avanzata</span>
                <strong>Ora: {liveSegment.title}</strong>
              </div>
              <Button size="lg" onClick={returnToLive}>Torna live</Button>
            </div>
          )}

          <nav
            ref={segmentTabsRef}
            className="segment-tabs"
            aria-label="Tappe del percorso"
          >
            {segments.map((segment, index) => (
              <Button
                key={segment.id}
                variant={index === displayedIndex ? 'default' : 'outline'}
                className="segment-tab"
                data-segment-index={index}
                aria-current={index === displayedIndex ? 'true' : undefined}
                onClick={() => showSegment(index)}
              >
                <strong>{segment.shortName}</strong>
              </Button>
            ))}
          </nav>

          <article className="segment-story">
            <h2 id="story-title">{displayedSegment.title}</h2>
            <p className="story-lead">{displayedSegment.lead}</p>

            <figure className="story-image">
              <img
                src={displayedSegment.photos[0].src}
                alt={displayedSegment.photos[0].alt}
              />
              <figcaption>{displayedSegment.photos[0].caption}</figcaption>
            </figure>

            <div className="story-copy">
              {displayedSegment.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <aside className={`curiosity${displayedSegment.curiosityPhoto ? ' curiosity-with-photo' : ''}`}>
              <div className="curiosity-text">
                {displayedSegment.curiosityLabel !== '' && <span>{displayedSegment.curiosityLabel ?? 'Lo sapevi che…'}</span>}
                <p>{displayedSegment.curiosity}</p>
              </div>
              {displayedSegment.curiosityPhoto && (
                <figure className="curiosity-photo">
                  <img
                    src={displayedSegment.curiosityPhoto.src}
                    alt={displayedSegment.curiosityPhoto.alt}
                    loading="lazy"
                  />
                  <figcaption>{displayedSegment.curiosityPhoto.caption}</figcaption>
                </figure>
              )}
            </aside>

            {displayedSegment.photos.length > 1 && (
              <div className="story-gallery" aria-label={`Altre fotografie: ${displayedSegment.shortName}`}>
                <h3>Altre immagini</h3>
                <div className="story-gallery-grid">
                  {displayedSegment.photos.slice(1).map((photo) => (
                    <figure key={photo.src}>
                      <img src={photo.src} alt={photo.alt} loading="lazy" />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </article>

          <Button size="lg" className="return-button" onClick={returnToLive}>
            <ArrowUp data-icon="inline-start" />
            Torna alla mappa in diretta
          </Button>

          <footer className="site-footer" aria-label="Contatti e fonti">
            <section className="contacts-card" aria-labelledby="contacts-title">
              <h2 id="contacts-title">Contatti</h2>
              <p className="contact-name">Comune di San Mango sul Calore</p>
              <address>
                <p>Via Cesare Battisti, 1<br />83050 San Mango sul Calore (AV)</p>
                <dl className="contact-details">
                  <div>
                    <dt>Telefono</dt>
                    <dd><a href="tel:+39082775358">0827 75358</a></dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd><a href="mailto:info@comune.sanmangosulcalore.av.it">info@comune.sanmangosulcalore.av.it</a></dd>
                  </div>
                </dl>
              </address>
              <p className="footer-links"><a href="https://www.comune.sanmangosulcalore.av.it/" target="_blank" rel="noopener noreferrer">Sito ufficiale del Comune</a></p>
              <p className="footer-note">Recapiti consultabili nelle schede della <a href="https://www.comune.sanmangosulcalore.av.it/vivere_il_comune/luoghi/luogo_1.html" target="_blank" rel="noopener noreferrer">sede comunale</a> e degli <a href="https://www.halleyweb.com/c064082/zf/index.php/uffici/index/detail/categoria/154/id/11" target="_blank" rel="noopener noreferrer">uffici comunali</a>.</p>
            </section>
            <section className="contacts-card sources-card" aria-labelledby="sources-title">
              <h2 id="sources-title">Fonti</h2>
              <ul className="sources-list">
                <li>Mnemoteche: archivio sociolinguistico della Campania</li>
                <li>La Cavalcata di Sant’Anna a San Mango sul Calore<span>Fiorenzo Iannino</span></li>
                <li>I monumenti storici di San Mango sul Calore<span>Fiorenzo Iannino</span></li>
              </ul>
              <p className="footer-note">Le fotografie provengono dall’archivio condiviso per questo progetto e dai contributi indicati.</p>
              <p className="footer-links">
                Approfondimenti online: <a href="https://www.scabec.it/luoghi/la-cavalcata-di-sant-anna-san-mango-sul-calore-av" target="_blank" rel="noopener noreferrer">Scabec</a>, <a href="https://www.comune.sanmangosulcalore.av.it/vivere_il_comune/luoghi/luogo_4.html" target="_blank" rel="noopener noreferrer">Ponte Romano</a>, <a href="https://www.comune.sanmangosulcalore.av.it/vivere_il_comune/luoghi/luogo_2.html" target="_blank" rel="noopener noreferrer">chiesa di Sant’Anna</a>, <a href="https://tabernacoli.blogspot.com/2013/12/san-mango-sul-calore-croce-e-san-pio-da.html" target="_blank" rel="noopener noreferrer">Croce e San Pio</a>.
              </p>
            </section>
          </footer>
        </div>
      </section>

      {!mapIsMainView && (
        <Button className="floating-live-button" size="lg" onClick={returnToLive}>
          <Radio data-icon="inline-start" />
          Torna alla diretta
        </Button>
      )}
    </main>
  );
}
