// src/components/Status/StatusPanel.tsx
"use client"

import { useState, useEffect } from 'react';

// Define types for system status data
interface SystemStatus {
    server: {
        status: 'online' | 'degraded' | 'offline';
        uptime: string;
        lastRestart: string;
        currentLoad: number;
        memoryUsage: number;
    };
    api: {
        status: 'online' | 'degraded' | 'offline';
        responseTime: string;
        requestsToday: number;
        errorRate: number;
        usage: number;
    };
    database: {
        status: 'online' | 'degraded' | 'offline';
        connections: number;
        queryLoad: number;
    };
    storage: {
        status: 'online' | 'degraded' | 'offline';
        totalSpace: string;
        usedSpace: string;
        usagePercent: number;
    };
}

interface Incident {
    id: string;
    severity: 'critical' | 'major' | 'minor';
    title: string;
    date: string;
    description: string;
    resolved: boolean;
}

export default function StatusPanel() {
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Fetch status data
    const fetchStatus = async () => {
        setLoading(true);
        setError(null);

        try {
            // In a real application, fetch from your API
            // const response = await fetch('/api/status');
            // const data = await response.json();

            // Simulate API response with mock data
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock data for demonstration
            setSystemStatus({
                server: {
                    status: 'online',
                    uptime: '99.9% (30 days)',
                    lastRestart: 'April 15, 2025 04:30 AM',
                    currentLoad: 42,
                    memoryUsage: 68
                },
                api: {
                    status: 'online',
                    responseTime: '145ms (avg)',
                    requestsToday: 12458,
                    errorRate: 0.02,
                    usage: 34
                },
                database: {
                    status: 'online',
                    connections: 24,
                    queryLoad: 16
                },
                storage: {
                    status: 'online',
                    totalSpace: '500 GB',
                    usedSpace: '215 GB',
                    usagePercent: 43
                }
            });

            setIncidents([
                {
                    id: '1',
                    severity: 'minor',
                    title: 'API Degraded Performance',
                    date: 'Apr 28, 2025',
                    description: 'API experienced increased latency for 15 minutes due to database maintenance. All systems now operating normally.',
                    resolved: true
                },
                {
                    id: '2',
                    severity: 'major',
                    title: 'Database Outage',
                    date: 'Apr 22, 2025',
                    description: 'Brief database outage affecting document retrieval. Issue resolved within 5 minutes. No data loss occurred.',
                    resolved: true
                },
                {
                    id: '3',
                    severity: 'minor',
                    title: 'Increased Error Rate',
                    date: 'Apr 18, 2025',
                    description: 'Temporary increase in API error rate due to network issues with our cloud provider. Service fully restored.',
                    resolved: true
                }
            ]);

            setLastRefreshed(new Date());
        } catch (err: any) {
            console.error('Error fetching status:', err);
            setError(err.message || 'Failed to load system status');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchStatus();

        // Optional: Set up auto-refresh every 30 seconds
        const intervalId = setInterval(fetchStatus, 30000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // Status indicator component
    const StatusIndicator = ({ status }: { status: 'online' | 'degraded' | 'offline' }) => {
        const colors = {
            online: 'bg-green-500',
            degraded: 'bg-yellow-500',
            offline: 'bg-red-500'
        };

        return (
            <span className="inline-flex items-center gap-2">
                <span className={`inline-block w-3 h-3 ${colors[status]} rounded-full`}></span>
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    // Severity indicator for incidents
    const SeverityIndicator = ({ severity }: { severity: 'critical' | 'major' | 'minor' }) => {
        const colors = {
            critical: 'bg-red-500',
            major: 'bg-orange-500',
            minor: 'bg-yellow-500'
        };

        return <span className={`inline-block w-2 h-2 ${colors[severity]} rounded-full`}></span>;
    };

    if (loading && !systemStatus) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">System Status</h1>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">System Status</h1>
                <div className="bg-red-100 text-red-700 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Error Loading Status</h2>
                    <p>{error}</p>
                    <button
                        onClick={fetchStatus}
                        className="mt-4 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-md"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Status</h1>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {lastRefreshed.toLocaleTimeString()}
                    </p>
                    <button
                        onClick={fetchStatus}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-4 dark:hover:bg-dark-5 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path>
                            <path d="M13 21h6v-6"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Server Status */}
                {systemStatus && (
                    <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Server Status
                            </h2>
                            <StatusIndicator status={systemStatus.server.status} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.server.uptime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Last Restart</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.server.lastRestart}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Current Load</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.server.currentLoad}%</span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Memory Usage
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {systemStatus.server.memoryUsage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                        style={{ width: `${systemStatus.server.memoryUsage}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded ${systemStatus.server.memoryUsage > 90 ? 'bg-red-500' :
                                                systemStatus.server.memoryUsage > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* API Status */}
                {systemStatus && (
                    <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                API Status
                            </h2>
                            <StatusIndicator status={systemStatus.api.status} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.api.responseTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Requests Today</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {systemStatus.api.requestsToday.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.api.errorRate}%</span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            API Usage
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {systemStatus.api.usage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                        style={{ width: `${systemStatus.api.usage}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 rounded"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Database Status */}
                {systemStatus && (
                    <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Database Status
                            </h2>
                            <StatusIndicator status={systemStatus.database.status} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Active Connections</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.database.connections}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Query Load</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.database.queryLoad}%</span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Query Load
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {systemStatus.database.queryLoad}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                        style={{ width: `${systemStatus.database.queryLoad}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 rounded"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Storage Status */}
                {systemStatus && (
                    <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Storage Status
                            </h2>
                            <StatusIndicator status={systemStatus.storage.status} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Space</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.storage.totalSpace}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Used Space</span>
                                <span className="font-medium text-gray-800 dark:text-white">{systemStatus.storage.usedSpace}</span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Storage Usage
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {systemStatus.storage.usagePercent}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                        style={{ width: `${systemStatus.storage.usagePercent}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded ${systemStatus.storage.usagePercent > 90 ? 'bg-red-500' :
                                                systemStatus.storage.usagePercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Incidents */}
            <div className="mt-8 bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>

                {incidents.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                            className="mx-auto text-gray-400 mb-2">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                        <p>No incidents reported in the last 30 days</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="py-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <SeverityIndicator severity={incident.severity} />
                                    <h3 className="font-medium text-gray-800 dark:text-white">{incident.title}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{incident.date}</span>
                                    {incident.resolved && (
                                        <span className="ml-auto text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                                            Resolved
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">{incident.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Actions */}
            <div className="mt-8 bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Actions</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        Run Diagnostics
                    </button>

                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Test Connections
                    </button>

                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        View System Logs
                    </button>
                </div>
            </div>
        </div>
    );
}