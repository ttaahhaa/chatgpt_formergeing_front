// src/components/Settings/SettingsPanel.tsx
"use client"

import { useState } from 'react';

// Define types for settings
interface AppSettings {
    general: {
        darkMode: boolean;
        notifications: boolean;
        soundEffects: boolean;
        autoRefresh: boolean;
    };
    api: {
        apiKey: string;
        endpoint: string;
        timeout: number;
    };
    privacy: {
        shareAnalytics: boolean;
        storeHistory: boolean;
        cookieConsent: boolean;
    };
    display: {
        fontSize: 'small' | 'medium' | 'large';
        compactMode: boolean;
        showAvatars: boolean;
    };
}

export default function SettingsPanel() {
    // Initial settings state
    const [settings, setSettings] = useState<AppSettings>({
        general: {
            darkMode: false,
            notifications: true,
            soundEffects: true,
            autoRefresh: true,
        },
        api: {
            apiKey: "sk-••••••••••••••••••••••••••••••",
            endpoint: "https://api.example.com/v1",
            timeout: 30,
        },
        privacy: {
            shareAnalytics: true,
            storeHistory: true,
            cookieConsent: true,
        },
        display: {
            fontSize: 'medium',
            compactMode: false,
            showAvatars: true,
        }
    });

    const [activeTab, setActiveTab] = useState('general');
    const [showApiKey, setShowApiKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Handle toggle switches
    const handleToggle = (section: keyof AppSettings, setting: string) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [setting]: !settings[section][setting as keyof typeof settings[keyof AppSettings]]
            }
        });
    };

    // Handle input changes
    const handleInputChange = (section: keyof AppSettings, setting: string, value: string | number) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [setting]: value
            }
        });
    };

    // Handle radio/select changes
    const handleSelectChange = (section: keyof AppSettings, setting: string, value: string) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [setting]: value
            }
        });
    };

    // Save settings
    const saveSettings = async () => {
        setSaveStatus('saving');

        try {
            // In a real app, this would be an API call
            // await fetch('/api/settings', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(settings),
            // });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setSaveStatus('success');

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        }
    };

    // Reset settings to defaults
    const resetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            setSettings({
                general: {
                    darkMode: false,
                    notifications: true,
                    soundEffects: true,
                    autoRefresh: true,
                },
                api: {
                    apiKey: "sk-••••••••••••••••••••••••••••••",
                    endpoint: "https://api.example.com/v1",
                    timeout: 30,
                },
                privacy: {
                    shareAnalytics: true,
                    storeHistory: true,
                    cookieConsent: true,
                },
                display: {
                    fontSize: 'medium',
                    compactMode: false,
                    showAvatars: true,
                }
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Application Settings</h1>

            {/* Settings Navigation */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px">
                    {['general', 'api', 'privacy', 'display'].map((tab) => (
                        <li key={tab} className="mr-2">
                            <button
                                onClick={() => setActiveTab(tab)}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === tab
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white dark:bg-dark-3 rounded-lg shadow p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">General Settings</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.general.darkMode}
                                        onChange={() => handleToggle('general', 'darkMode')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive in-app notifications</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.general.notifications}
                                        onChange={() => handleToggle('general', 'notifications')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Sound Effects</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for actions and notifications</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.general.soundEffects}
                                        onChange={() => handleToggle('general', 'soundEffects')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Auto-Refresh</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically refresh data every 30 seconds</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.general.autoRefresh}
                                        onChange={() => handleToggle('general', 'autoRefresh')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* API Settings */}
                {activeTab === 'api' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    API Key
                                </label>
                                <div className="flex">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        className="flex-1 rounded-l-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        value={settings.api.apiKey}
                                        onChange={(e) => handleInputChange('api', 'apiKey', e.target.value)}
                                        readOnly={!showApiKey}
                                    />
                                    <button
                                        className="rounded-r-md bg-primary px-4 py-2.5 text-white hover:bg-primary-dark"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        {showApiKey ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    API Endpoint
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    value={settings.api.endpoint}
                                    onChange={(e) => handleInputChange('api', 'endpoint', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Request Timeout (seconds)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    value={settings.api.timeout}
                                    onChange={(e) => handleInputChange('api', 'timeout', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="pt-4">
                                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                                    Test Connection
                                </button>
                                <button className="ml-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm">
                                    Generate New API Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Share Analytics</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Help us improve by sharing anonymous usage data</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.privacy.shareAnalytics}
                                        onChange={() => handleToggle('privacy', 'shareAnalytics')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Store Chat History</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Save your conversation history</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.privacy.storeHistory}
                                        onChange={() => handleToggle('privacy', 'storeHistory')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Cookie Consent</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow cookies for improved functionality</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.privacy.cookieConsent}
                                        onChange={() => handleToggle('privacy', 'cookieConsent')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">
                                    Clear All Data
                                </button>
                                <button className="ml-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm">
                                    Export My Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display Settings */}
                {activeTab === 'display' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Display Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Font Size
                                </label>
                                <div className="flex space-x-4">
                                    {['small', 'medium', 'large'].map((size) => (
                                        <label key={size} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="fontSize"
                                                value={size}
                                                checked={settings.display.fontSize === size}
                                                onChange={() => handleSelectChange('display', 'fontSize', size)}
                                                className="mr-2 text-primary focus:ring-primary dark:focus:ring-primary"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">{size}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Compact Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Display more content with less spacing</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.display.compactMode}
                                        onChange={() => handleToggle('display', 'compactMode')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Show Avatars</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Display user avatars in chats</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-full checked:bg-primary"
                                        checked={settings.display.showAvatars}
                                        onChange={() => handleToggle('display', 'showAvatars')}
                                    />
                                    <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-primary/20"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <button
                        onClick={resetSettings}
                        className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-dark-4 dark:text-gray-200 dark:hover:bg-dark-5 rounded-md"
                    >
                        Reset to Defaults
                    </button>

                    <div className="flex items-center gap-4">
                        {saveStatus === 'success' && (
                            <span className="text-green-600 dark:text-green-400 text-sm">
                                Settings saved successfully!
                            </span>
                        )}

                        {saveStatus === 'error' && (
                            <span className="text-red-600 dark:text-red-400 text-sm">
                                Failed to save settings
                            </span>
                        )}

                        <button
                            onClick={saveSettings}
                            disabled={saveStatus === 'saving'}
                            className={`px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md flex items-center gap-2 ${saveStatus === 'saving' ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}