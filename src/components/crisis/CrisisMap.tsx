'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, MapPin, CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Report {
    _id: string;
    location: { lat: number; lng: number };
    description: string;
    severity: string;
    timestamp: string;
    verified?: boolean;
}

export default function CrisisMap() {
    const { dictionary } = useAccessibility();
    const t = dictionary.crisis;
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [nssMode, setNssMode] = useState(false);
    const [icon, setIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIcon(L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            }));
        }
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/crisis/reports');
                const data = await res.json();
                setReports(data.incidents || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const severityLabels: Record<string, string> = {
        low: t.low,
        medium: t.medium,
        high: t.high,
        critical: t.critical,
    };

    const toggleVerify = (id: string) => {
        setReports(prev => prev.map(r => r._id === id ? { ...r, verified: !r.verified } : r));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl transition-colors", nssMode ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400")}>
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">{t.nssMode}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.nssDesc}</p>
                    </div>
                </div>
                <button
                    onClick={() => setNssMode(!nssMode)}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", nssMode ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                >
                    {nssMode ? t.disableVolunteer : t.enableVolunteer}
                </button>
            </div>

            <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-10">
                <MapContainer center={[12.9716, 77.5946]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reports.map((report) => (
                        <Marker
                            key={report._id}
                            position={[report.location.lat, report.location.lng]}
                            icon={icon || undefined}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", report.severity === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>
                                                {severityLabels[report.severity] || report.severity}
                                            </span>
                                            {report.verified && (
                                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    ✓ {dictionary.common.verified}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3">
                                        {report.description}
                                    </p>

                                    {nssMode && !report.verified && (
                                        <button
                                            onClick={() => toggleVerify(report._id)}
                                            className="w-full bg-orange-500 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-orange-600 transition-colors uppercase tracking-widest"
                                        >
                                            {t.verifyIncident}
                                        </button>
                                    )}

                                    <div className="mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                                        {new Date(report.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
