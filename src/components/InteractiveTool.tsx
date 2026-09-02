import React, { useState } from 'react';
import { Calculator, Printer, Boxes, Cog, CheckCircle2 } from 'lucide-react';

export const InteractiveTool: React.FC = () => {
  const [toolType, setToolType] = useState<'3d-strength' | 'silicone-mold' | 'belt-c2c'>('3d-strength');

  // 1. 3D Print Strength & Slicing Calculator
  const [nozzleSize, setNozzleSize] = useState<number>(0.4);
  const [perimeterLoops, setPerimeterLoops] = useState<number>(4);
  const [infillDensity, setInfillDensity] = useState<number>(30);
  const [materialType, setMaterialType] = useState<'pla' | 'petg' | 'pacf' | 'tpu'>('pacf');

  // 2. Silicone / Polyurethane Mold Volume & Mix Ratio Calculator
  const [moldShape, setMoldShape] = useState<'cylinder' | 'box'>('cylinder');
  const [outerDiameterMm, setOuterDiameterMm] = useState<number>(50.8); // 2.0 inch standard roller
  const [innerHubDiameterMm, setInnerHubDiameterMm] = useState<number>(14.0); // REV Nub hub core
  const [rollerLengthMm, setRollerLengthMm] = useState<number>(35.0); // 35mm wide
  const [boxLengthMm, setBoxLengthMm] = useState<number>(60.0);
  const [boxWidthMm, setBoxWidthMm] = useState<number>(40.0);
  const [boxHeightMm, setBoxHeightMm] = useState<number>(30.0);
  const [mixRatioType, setMixRatioType] = useState<'100:100' | '100:10'>('100:100'); // 1:1 vs 10:1

  // 3. Timing Belt Center-to-Center Distance Calculator
  const [beltPitchMm, setBeltPitchMm] = useState<number>(3); // HTD 3M or 5M
  const [pulley1Teeth, setPulley1Teeth] = useState<number>(24);
  const [pulley2Teeth, setPulley2Teeth] = useState<number>(48);
  const [desiredC2CInches, setDesiredC2CInches] = useState<number>(3.5);

  // 3D Strength Calculations
  const wallThicknessMm = nozzleSize * perimeterLoops * 1.15; // with slight perimeter overlap
  const materialTensileYield = materialType === 'pla' ? 52 : materialType === 'petg' ? 48 : materialType === 'pacf' ? 88 : 38;
  const relativeTorsionalRating = (Math.pow(wallThicknessMm, 2) * (materialTensileYield / 50) * (1 + infillDensity / 100)).toFixed(1);

  // Mold Calculations
  let cavityVolumeCm3 = 0;
  if (moldShape === 'cylinder') {
    const outerRadiusCm = (outerDiameterMm / 2) / 10;
    const innerRadiusCm = (innerHubDiameterMm / 2) / 10;
    const lengthCm = rollerLengthMm / 10;
    cavityVolumeCm3 = Math.PI * (Math.pow(outerRadiusCm, 2) - Math.pow(innerRadiusCm, 2)) * lengthCm;
  } else {
    cavityVolumeCm3 = (boxLengthMm / 10) * (boxWidthMm / 10) * (boxHeightMm / 10);
  }
  const elastomerDensity = 1.08; // g/cm³ typical polyurethane (VytaFlex)
  const totalElastomerGrams = Math.max(0, cavityVolumeCm3 * elastomerDensity);
  const safetyFactorGrams = totalElastomerGrams * 1.15; // 15% allowance for sprue, vents & cup residue

  let partAGrams = 0;
  let partBGrams = 0;
  if (mixRatioType === '100:100') {
    partAGrams = safetyFactorGrams / 2;
    partBGrams = safetyFactorGrams / 2;
  } else {
    // 100:10 ratio
    partAGrams = (safetyFactorGrams / 110) * 100;
    partBGrams = (safetyFactorGrams / 110) * 10;
  }

  // Belt Calculations
  const p1PitchDia = (pulley1Teeth * beltPitchMm) / Math.PI;
  const p2PitchDia = (pulley2Teeth * beltPitchMm) / Math.PI;
  const desiredC2CMm = desiredC2CInches * 25.4;
  const estimatedBeltPitchLength = (2 * desiredC2CMm) + (Math.PI * (p1PitchDia + p2PitchDia) / 2) + (Math.pow(p2PitchDia - p1PitchDia, 2) / (4 * desiredC2CMm));
  const nearestBeltTeeth = Math.round(estimatedBeltPitchLength / beltPitchMm);
  const exactBeltPitchLength = nearestBeltTeeth * beltPitchMm;
  
  // Exact C-to-C with nearest standard belt
  const b = (2 * exactBeltPitchLength) - (Math.PI * (p1PitchDia + p2PitchDia));
  const exactC2CMm = (b + Math.sqrt(Math.max(0, Math.pow(b, 2) - 8 * Math.pow(p2PitchDia - p1PitchDia, 2)))) / 8;
  const exactC2CInches = exactC2CMm / 25.4;

  return (
    <div className="my-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-blue-800/60 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/40 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base font-['Outfit'] tracking-tight">
              Hardware & Custom Manufacturing Engineering Calculator
            </h4>
            <p className="text-xs text-blue-300">
              Interactive tolerance, stress modeling, and mold mixing algorithms
            </p>
          </div>
        </div>

        {/* Tool Switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-blue-900/80 text-xs font-medium self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setToolType('3d-strength')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              toolType === '3d-strength' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            3D Print Shell Rigidity
          </button>
          <button
            onClick={() => setToolType('silicone-mold')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              toolType === 'silicone-mold' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Molding Pour & Ratio
          </button>
          <button
            onClick={() => setToolType('belt-c2c')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              toolType === 'belt-c2c' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Timing Belt C-to-C
          </button>
        </div>
      </div>

      {toolType === '3d-strength' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Nozzle Diameter
                </label>
                <select
                  value={nozzleSize}
                  onChange={(e) => setNozzleSize(parseFloat(e.target.value))}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                >
                  <option value={0.4}>0.4 mm (Standard)</option>
                  <option value={0.6}>0.6 mm (High-Flow)</option>
                  <option value={0.8}>0.8 mm (Heavy Structural)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Filament Family
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as any)}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                >
                  <option value="pacf">PA-CF (Nylon 12 CF)</option>
                  <option value="pla">PLA+ / Pro PLA</option>
                  <option value="petg">PETG</option>
                  <option value="tpu">TPU 95A (Flexible)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-blue-200 mb-1">
                <span>Perimeter Wall Loops:</span>
                <span className="font-mono text-blue-400">{perimeterLoops} loops</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={perimeterLoops}
                onChange={(e) => setPerimeterLoops(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>2 (Weak shell)</span>
                <span>4 (Standard FTC)</span>
                <span>6+ (Extreme torque)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-blue-200 mb-1">
                <span>Infill Density (% Gyroid):</span>
                <span className="font-mono text-blue-400">{infillDensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={infillDensity}
                onChange={(e) => setInfillDensity(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-blue-900/60 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Calculated Shell Mechanical Properties
              </span>

              <div>
                <span className="text-xs text-slate-400">Total Solid Shell Thickness:</span>
                <div className="text-2xl font-bold font-mono text-blue-400">
                  {wallThicknessMm.toFixed(2)} <span className="text-xs text-slate-400 font-normal">mm ({((wallThicknessMm / 25.4) * 1000).toFixed(0)} thou)</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Comparative Bending / Torque Index:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {relativeTorsionalRating} <span className="text-xs text-slate-400 font-normal">pts</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
                <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {wallThicknessMm >= 2.0 ? 'Exceeds FTC high-impact frame threshold' : 'Suitable for light sensor mounts & wire clips'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-blue-950/60 rounded border border-blue-900/80 text-[11px] text-blue-200">
              💡 <strong>Slicer Pro-Tip:</strong> Set perimeter extrusion width to <strong>0.48mm</strong> for 0.4mm nozzle to maximize inter-layer weld fusion.
            </div>
          </div>
        </div>
      )}

      {toolType === 'silicone-mold' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Mold Geometry
                </label>
                <div className="flex rounded-lg overflow-hidden border border-blue-900 text-xs">
                  <button
                    onClick={() => setMoldShape('cylinder')}
                    className={`flex-1 py-1.5 ${moldShape === 'cylinder' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 text-slate-300'}`}
                  >
                    Roller / Wheel
                  </button>
                  <button
                    onClick={() => setMoldShape('box')}
                    className={`flex-1 py-1.5 ${moldShape === 'box' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 text-slate-300'}`}
                  >
                    Block / Pad
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Mix Ratio By Weight
                </label>
                <select
                  value={mixRatioType}
                  onChange={(e) => setMixRatioType(e.target.value as any)}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                >
                  <option value="100:100">1:1 (VytaFlex / Dragon Skin)</option>
                  <option value="100:10">10:1 (PMC-780 / High Hardness)</option>
                </select>
              </div>
            </div>

            {moldShape === 'cylinder' ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Outer Dia (mm)</label>
                  <input
                    type="number"
                    step="1"
                    value={outerDiameterMm}
                    onChange={(e) => setOuterDiameterMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Hub Core Dia (mm)</label>
                  <input
                    type="number"
                    step="1"
                    value={innerHubDiameterMm}
                    onChange={(e) => setInnerHubDiameterMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Length (mm)</label>
                  <input
                    type="number"
                    step="1"
                    value={rollerLengthMm}
                    onChange={(e) => setRollerLengthMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Length (mm)</label>
                  <input
                    type="number"
                    value={boxLengthMm}
                    onChange={(e) => setBoxLengthMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={boxWidthMm}
                    onChange={(e) => setBoxWidthMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-blue-200 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={boxHeightMm}
                    onChange={(e) => setBoxHeightMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-blue-900 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Card */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-blue-900/60 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Scale Weight Dispensing Target (+15% Spillage Margin)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-blue-950/80 rounded-lg border border-blue-900/60">
                  <span className="text-[10px] text-blue-300 uppercase font-semibold block">Part A Weight:</span>
                  <div className="text-xl font-bold font-mono text-white">
                    {partAGrams.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-950/80 rounded-lg border border-blue-900/60">
                  <span className="text-[10px] text-blue-300 uppercase font-semibold block">Part B Weight:</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {partBGrams.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex justify-between pt-1">
                <span>Net Cavity Volume:</span>
                <span className="font-mono font-bold text-white">{cavityVolumeCm3.toFixed(1)} cm³ (mL)</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-emerald-950/60 rounded border border-emerald-900/80 text-[11px] text-emerald-200">
              🧪 <strong>Degassing Note:</strong> Degas at -29 inHg until full collapse, then pour in pencil stream.
            </div>
          </div>
        </div>
      )}

      {toolType === 'belt-c2c' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Belt Tooth Pitch
                </label>
                <select
                  value={beltPitchMm}
                  onChange={(e) => setBeltPitchMm(parseFloat(e.target.value))}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                >
                  <option value={3}>HTD 3M (3.0 mm pitch)</option>
                  <option value={5}>HTD 5M (5.0 mm pitch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Target C-to-C (Inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={desiredC2CInches}
                  onChange={(e) => setDesiredC2CInches(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Driver Pulley (Teeth)</label>
                <input
                  type="number"
                  step="1"
                  value={pulley1Teeth}
                  onChange={(e) => setPulley1Teeth(parseInt(e.target.value) || 12)}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Driven Pulley (Teeth)</label>
                <input
                  type="number"
                  step="1"
                  value={pulley2Teeth}
                  onChange={(e) => setPulley2Teeth(parseInt(e.target.value) || 12)}
                  className="w-full bg-slate-800/90 border border-blue-900 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-blue-900/60 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Standard Timing Belt Specification
              </span>

              <div>
                <span className="text-xs text-slate-400">Nearest Standard Belt Tooth Count:</span>
                <div className="text-2xl font-bold font-mono text-blue-400">
                  {nearestBeltTeeth}T <span className="text-xs text-slate-400 font-normal">({exactBeltPitchLength} mm pitch length)</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Exact Center-to-Center Distance:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {exactC2CInches.toFixed(3)}" <span className="text-xs text-slate-400 font-normal">({exactC2CMm.toFixed(2)} mm)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-blue-950/60 rounded border border-blue-900/80 text-[11px] text-blue-200">
              ⚙️ <strong>Ratio:</strong> {(pulley2Teeth / pulley1Teeth).toFixed(2)}:1 speed reduction. Pitch Dia: {p1PitchDia.toFixed(1)}mm / {p2PitchDia.toFixed(1)}mm.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
