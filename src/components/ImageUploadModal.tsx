import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  Cpu, 
  Compass, 
  Move,
  Info
} from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (markdownText: string) => void;
}

// Preset technical diagrams for FTC teams
const FTC_DIAGRAM_PRESETS = [
  {
    id: 'odometry-pods',
    title: '3-Wheel Odometry Pod Geometry',
    category: 'Kinematics & Localization',
    description: 'Dead wheel layout with two parallel tracking wheels (Left/Right) and one perpendicular wheel (Back/Lateral) showing distance offsets from robot center.',
    alt: 'FTC Dead-Wheel 3-Pod Odometry Coordinate System and Wheel Offsets',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <rect width="800" height="480" fill="#0f172a" rx="16"/>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80"/>
        </marker>
      </defs>
      <rect width="800" height="480" fill="url(#grid)"/>
      <!-- Robot Chassis Bounds -->
      <rect x="220" y="80" width="360" height="320" rx="12" fill="#1e293b" fill-opacity="0.6" stroke="#3b82f6" stroke-dasharray="6 6" stroke-width="2"/>
      <text x="400" y="110" fill="#93c5fd" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">18" × 18" FTC ROBOT CHASSIS FRAME</text>
      <!-- Center of Rotation -->
      <circle cx="400" cy="240" r="6" fill="#f43f5e"/>
      <circle cx="400" cy="240" r="14" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="400" y="265" fill="#fda4af" font-family="monospace" font-size="12" text-anchor="middle">Center of Rotation (0,0)</text>
      <!-- Left Pod -->
      <rect x="250" y="190" width="20" height="70" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
      <line x1="260" y1="225" x2="400" y2="240" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="260" y="175" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Left Pod (y_L)</text>
      <text x="320" y="225" fill="#7dd3fc" font-family="monospace" font-size="11">d_left</text>
      <!-- Right Pod -->
      <rect x="530" y="190" width="20" height="70" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
      <line x1="540" y1="225" x2="400" y2="240" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="540" y="175" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Right Pod (y_R)</text>
      <text x="470" y="225" fill="#7dd3fc" font-family="monospace" font-size="11">d_right</text>
      <!-- Back / Perpendicular Pod -->
      <rect x="365" y="340" width="70" height="20" rx="4" fill="#4ade80" stroke="#16a34a" stroke-width="2"/>
      <line x1="400" y1="350" x2="400" y2="240" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="400" y="385" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Perpendicular Pod (x_back)</text>
      <text x="415" y="300" fill="#86efac" font-family="monospace" font-size="11">d_back</text>
      <!-- Robot Forward Vector -->
      <line x1="400" y1="240" x2="400" y2="135" stroke="#facc15" stroke-width="3" marker-end="url(#arrow)"/>
      <text x="420" y="150" fill="#facc15" font-family="sans-serif" font-size="12" font-weight="bold">+Y Forward</text>
      <!-- Formula box -->
      <rect x="40" y="390" width="720" height="65" rx="8" fill="#020617" stroke="#334155"/>
      <text x="60" y="415" fill="#e2e8f0" font-family="monospace" font-size="12">Heading: Δθ = (ΔR - ΔL) / TrackWidth   |   ΔY = (ΔL + ΔR) / 2</text>
      <text x="60" y="438" fill="#38bdf8" font-family="monospace" font-size="12">ΔX = ΔBack - (ForwardOffset × Δθ)       |   Spring Tension: 2.5–3.5 lbs/pod</text>
    </svg>`
  },
  {
    id: 'mecanum-vectors',
    title: 'Mecanum Drive Roller Vectors',
    category: 'Drivetrain & Dynamics',
    description: '45-degree angle roller orientations and resultant force vector combinations for omnidirectional translation and zero-radius turn.',
    alt: 'FTC Mecanum Wheel 45-degree Roller Configuration and Force Vectors',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <rect width="800" height="480" fill="#0f172a" rx="16"/>
      <defs>
        <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="480" fill="url(#grid2)"/>
      <text x="400" y="40" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">MECANUM "O" / "X" ROLLER VECTOR TOPOLOGY</text>
      <!-- Chassis Outline -->
      <rect x="220" y="70" width="360" height="320" rx="14" fill="#1e293b" fill-opacity="0.8" stroke="#475569" stroke-width="2"/>
      <!-- Top Left Wheel (Roller angled pointing to center) -->
      <rect x="180" y="90" width="50" height="90" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <line x1="185" y1="170" x2="225" y2="100" stroke="#38bdf8" stroke-width="4"/>
      <text x="140" y="140" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">FL</text>
      <!-- Top Right Wheel -->
      <rect x="570" y="90" width="50" height="90" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <line x1="575" y1="100" x2="615" y2="170" stroke="#38bdf8" stroke-width="4"/>
      <text x="635" y="140" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">FR</text>
      <!-- Bottom Left Wheel -->
      <rect x="180" y="280" width="50" height="90" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <line x1="185" y1="290" x2="225" y2="360" stroke="#38bdf8" stroke-width="4"/>
      <text x="140" y="330" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">BL</text>
      <!-- Bottom Right Wheel -->
      <rect x="570" y="280" width="50" height="90" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <line x1="575" y1="360" x2="615" y2="290" stroke="#38bdf8" stroke-width="4"/>
      <text x="635" y="330" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">BR</text>
      <!-- Center X Visualizer -->
      <line x1="230" y1="135" x2="570" y2="325" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 6"/>
      <line x1="570" y1="135" x2="230" y2="325" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="400" cy="230" r="20" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
      <text x="400" y="235" fill="#f43f5e" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">X</text>
      <text x="400" y="275" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Top view: Rollers form an "X" on top surface</text>
      <!-- Vector Legend -->
      <rect x="40" y="410" width="720" height="50" rx="8" fill="#020617" stroke="#334155"/>
      <text x="60" y="440" fill="#4ade80" font-family="monospace" font-size="12">Forward: [+,+,+,+]  |  Strafe Right: [+,-,-,+]  |  Turn Right: [+,-,+,-]</text>
    </svg>`
  },
  {
    id: 'htd-pulley-profile',
    title: 'HTD 5M Pulley Tooth Profile & 3D Printing',
    category: 'Fabrication & 3D Printing',
    description: 'Curvilinear tooth mesh specs, pitch circle diameter calculation, and recommended horizontal expansion compensation for FDM pulleys.',
    alt: 'HTD 5M Timing Belt Pulley Tooth Pitch and 3D Print Tolerances',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <rect width="800" height="480" fill="#0f172a" rx="16"/>
      <text x="400" y="45" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">HTD 5M PULLEY MESH &amp; 3D PRINT SLICING TOLERANCE</text>
      <!-- Tooth profile drawing -->
      <path d="M 100 220 C 140 220, 150 140, 180 140 C 210 140, 220 220, 260 220 C 300 220, 310 140, 340 140 C 370 140, 380 220, 420 220 C 460 220, 470 140, 500 140 C 530 140, 540 220, 580 220 C 620 220, 630 140, 660 140 C 690 140, 700 220, 740 220" fill="none" stroke="#38bdf8" stroke-width="4"/>
      <!-- Pitch line -->
      <line x1="80" y1="180" x2="760" y2="180" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="765" y="185" fill="#fda4af" font-family="monospace" font-size="11">Pitch Line (PLD = 0.57mm)</text>
      <!-- Dimensions markers -->
      <line x1="180" y1="110" x2="340" y2="110" stroke="#4ade80" stroke-width="2"/>
      <circle cx="180" cy="110" r="3" fill="#4ade80"/>
      <circle cx="340" cy="110" r="3" fill="#4ade80"/>
      <text x="260" y="100" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Pitch (P = 5.00mm)</text>
      <line x1="180" y1="115" x2="180" y2="140" stroke="#4ade80" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="340" y1="115" x2="340" y2="140" stroke="#4ade80" stroke-width="1" stroke-dasharray="2 2"/>
      <!-- Tooth Depth -->
      <line x1="435" y1="140" x2="435" y2="220" stroke="#fbbf24" stroke-width="2"/>
      <text x="445" y="185" fill="#fde047" font-family="monospace" font-size="11">Tooth Depth: 2.06mm</text>
      <!-- Recommendations card -->
      <rect x="60" y="270" width="680" height="170" rx="10" fill="#1e293b" stroke="#334155"/>
      <text x="80" y="300" fill="#93c5fd" font-family="sans-serif" font-size="14" font-weight="bold">Optimal Slicing Configurations for 3D Printed Pulleys:</text>
      <text x="80" y="330" fill="#cbd5e1" font-family="monospace" font-size="12">• Material: PETG, ASA, or Nylon-CF (Avoid standard PLA for high-shock loads)</text>
      <text x="80" y="355" fill="#cbd5e1" font-family="monospace" font-size="12">• Perimeter Walls: 5+ walls (ensure 100% solid hoop stress between bore &amp; teeth)</text>
      <text x="80" y="380" fill="#cbd5e1" font-family="monospace" font-size="12">• Slicer Compensation: Slic3r/Orca "X-Y Hole Compensation" = +0.10mm to +0.15mm</text>
      <text x="80" y="405" fill="#4ade80" font-family="monospace" font-size="12">• Calculation: Pitch Diameter (PCD) = (TeethCount × 5mm) / π</text>
    </svg>`
  },
  {
    id: 'cascade-slide-rigging',
    title: 'Cascade vs Continuous Linear Slide Rigging',
    category: 'Mechanism Rigging',
    description: 'Cable path schematics, intermediate stage pulley routing, dual-spool dead reckoning, and spring-loaded extension tensioning.',
    alt: 'FTC Cascade Linear Slide Cable Routing Schematic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <rect width="800" height="480" fill="#0f172a" rx="16"/>
      <text x="400" y="45" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">CASCADE EXTENSION CABLE ROUTING (STAGE 1 TO 3)</text>
      <!-- Base Stage -->
      <rect x="150" y="80" width="60" height="340" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <text x="180" y="440" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Base Stage</text>
      <!-- Stage 1 -->
      <rect x="230" y="110" width="60" height="310" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <text x="260" y="440" fill="#60a5fa" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Stage 1</text>
      <!-- Stage 2 / Carriage -->
      <rect x="310" y="140" width="60" height="280" rx="6" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
      <text x="340" y="440" fill="#c084fc" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Carriage</text>
      <!-- Cable 1: Winch to Stage 1 -->
      <circle cx="80" cy="380" r="22" fill="#334155" stroke="#f43f5e" stroke-width="2"/>
      <text x="80" y="385" fill="#fda4af" font-family="sans-serif" font-size="10" text-anchor="middle">Spool</text>
      <path d="M 95 365 L 180 110 L 230 400" fill="none" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="180" cy="110" r="8" fill="#facc15"/>
      <!-- Cable 2: Base to Stage 2 -->
      <path d="M 180 380 L 260 140 L 310 400" fill="none" stroke="#4ade80" stroke-width="2.5"/>
      <circle cx="260" cy="140" r="8" fill="#facc15"/>
      <!-- Info callout -->
      <rect x="420" y="100" width="340" height="300" rx="12" fill="#020617" stroke="#334155"/>
      <text x="440" y="135" fill="#38bdf8" font-family="sans-serif" font-size="15" font-weight="bold">Cascade Rigging Properties:</text>
      <text x="440" y="170" fill="#e2e8f0" font-family="sans-serif" font-size="12">✓ Velocity Multiplier: Stage Count × Spool Speed</text>
      <text x="440" y="195" fill="#e2e8f0" font-family="sans-serif" font-size="12">✓ Total extension achieved in 1 motor rotation</text>
      <text x="440" y="220" fill="#e2e8f0" font-family="sans-serif" font-size="12">✓ Separate independent cables prevent single-point chain snap</text>
      <text x="440" y="255" fill="#f87171" font-family="sans-serif" font-size="12">⚠ Requires high motor torque (Torque = N × Load)</text>
      <text x="440" y="280" fill="#f87171" font-family="sans-serif" font-size="12">⚠ Constant-force springs needed for gravity return</text>
      <text x="440" y="320" fill="#facc15" font-family="monospace" font-size="11">Recommended Cord: 1.0mm UHMWPE (Spectra/Dyneema 200lb+)</text>
      <text x="440" y="345" fill="#94a3b8" font-family="monospace" font-size="11">Pulley Bearing: MR63ZZ or MR84ZZ Flanged</text>
    </svg>`
  }
];

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  
  // Upload tab state
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL tab state
  const [webUrl, setWebUrl] = useState<string>('');
  const [urlAltText, setUrlAltText] = useState<string>('');
  const [urlTestStatus, setUrlTestStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Presets tab state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(FTC_DIAGRAM_PRESETS[0].id);

  if (!isOpen) return null;

  // Process and compress image to avoid huge localStorage bloat
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    setFileName(file.name);
    const cleanedName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    setAltText(cleanedName);
    setFileSizeStr(`${(file.size / 1024).toFixed(1)} KB`);
    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsCompressing(false);
        return;
      }

      // If SVG or small file (< 300KB), keep directly
      if (file.type === 'image/svg+xml' || file.size < 300 * 1024) {
        setUploadedDataUrl(result);
        setIsCompressing(false);
        return;
      }

      // Optimize large bitmap images using canvas
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const compressed = canvas.toDataURL(outputFormat, 0.85);
          setUploadedDataUrl(compressed);
        } else {
          setUploadedDataUrl(result);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setUploadedDataUrl(result);
        setIsCompressing(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleInsertUploaded = () => {
    if (!uploadedDataUrl) return;
    const caption = altText.trim() || 'Mechanism Diagram';
    const markdown = `\n\n![${caption}](${uploadedDataUrl})\n\n`;
    onInsertImage(markdown);
    onClose();
  };

  const handleInsertUrl = () => {
    if (!webUrl.trim()) return;
    const caption = urlAltText.trim() || 'Technical Diagram';
    const markdown = `\n\n![${caption}](${webUrl.trim()})\n\n`;
    onInsertImage(markdown);
    onClose();
  };

  const handleInsertPreset = (preset: typeof FTC_DIAGRAM_PRESETS[0]) => {
    const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
    const markdown = `\n\n![${preset.alt}](${encodedSvg})\n\n`;
    onInsertImage(markdown);
    onClose();
  };

  const selectedPreset = FTC_DIAGRAM_PRESETS.find(p => p.id === selectedPresetId) || FTC_DIAGRAM_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Insert Image or Technical Diagram
              </h3>
              <p className="text-xs text-slate-500">
                Embed CAD screenshots, mechanism blueprints, and engineering graphics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image File</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>FTC Blueprint Presets</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          
          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedDataUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    dragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to choose image or drag &amp; drop here
                    </p>
                    <p className="text-slate-500 mt-1">
                      Supports PNG, JPG, WebP, GIF, or SVG (CAD renders, robot photos, diagrams)
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs">
                    Browse Computer
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Uploaded Preview */}
                  <div className="relative rounded-xl border border-slate-200 bg-slate-900/5 p-2 flex flex-col items-center max-h-60 overflow-hidden">
                    <img
                      src={uploadedDataUrl}
                      alt={altText}
                      className="max-h-52 object-contain rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadedDataUrl('');
                        setFileName('');
                      }}
                      className="absolute top-4 right-4 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg transition-colors text-xs"
                      title="Choose a different image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono truncate max-w-xs">{fileName}</span>
                    <span>{fileSizeStr}</span>
                  </div>

                  {/* Alt Text / Caption */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Image Caption / Alt Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="e.g. Dual-Wheel Intake CAD Assembly with Compliant Rollers"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Displayed under the image and helps team members quickly understand the subsystem.
                    </p>
                  </div>
                </div>
              )}

              {/* Helpful notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Pro Tip:</strong> You can also paste screenshots directly into the editor using <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300 font-mono text-[10px]">Ctrl+V</kbd> or drag image files straight onto the editor!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: WEB URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image Web URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => {
                    setWebUrl(e.target.value);
                    setUrlTestStatus('idle');
                  }}
                  placeholder="https://example.com/images/robot-cad.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image Caption / Alt Description
                </label>
                <input
                  type="text"
                  value={urlAltText}
                  onChange={(e) => setUrlAltText(e.target.value)}
                  placeholder="e.g. Odometry Dead Wheel Pod CAD Schematic"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {webUrl && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700 mb-2">Image Preview:</p>
                  <div className="flex justify-center max-h-48 overflow-hidden rounded-lg bg-white border border-slate-200 p-2">
                    <img
                      src={webUrl}
                      alt={urlAltText || 'Preview'}
                      onLoad={() => setUrlTestStatus('valid')}
                      onError={() => setUrlTestStatus('invalid')}
                      className="max-h-44 object-contain"
                    />
                  </div>
                  {urlTestStatus === 'invalid' && (
                    <p className="text-red-600 text-[11px] mt-2 font-medium">
                      Failed to load image from this URL. Check permissions or direct image link.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FTC PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Choose from pre-drawn engineering blueprints standard across championship FTC teams:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FTC_DIAGRAM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedPresetId === preset.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                          {preset.category}
                        </span>
                        {selectedPresetId === preset.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{preset.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Preset Preview */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-3">
                <div className="flex items-center justify-between text-slate-300 text-[11px] mb-2 font-mono">
                  <span>PREVIEW: {selectedPreset.title}</span>
                  <span className="text-blue-400">Vector SVG</span>
                </div>
                <div 
                  className="max-h-52 overflow-hidden flex items-center justify-center rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedPreset.svg }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'upload' && (
            <button
              disabled={!uploadedDataUrl || isCompressing}
              onClick={handleInsertUploaded}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white transition-all ${
                uploadedDataUrl && !isCompressing
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Insert Image into Article</span>
            </button>
          )}

          {activeTab === 'url' && (
            <button
              disabled={!webUrl.trim()}
              onClick={handleInsertUrl}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white transition-all ${
                webUrl.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Insert Web Image</span>
            </button>
          )}

          {activeTab === 'presets' && (
            <button
              onClick={() => handleInsertPreset(selectedPreset)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Insert Selected Blueprint</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
