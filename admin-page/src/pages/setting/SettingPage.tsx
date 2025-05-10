"use client"

import { Badge } from "../../components/ui/badge"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Separator } from "../../components/ui/separator"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../components/ui/use-toast"
import { User, Lock, Bell, Database, HardDrive, Upload, Download, AlertTriangle } from "lucide-react"

const SettingPage = () => {
    const [activeTab, setActiveTab] = useState("account")
    const { toast } = useToast()

    const handleSave = (section: string) => {
        toast({
            title: "Settings Saved",
            description: `Your ${section} settings have been updated successfully.`,
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto">
                    <TabsTrigger value="account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span className="hidden sm:inline">System</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Advanced</span>
                    </TabsTrigger>
                </TabsList>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your account profile information and email address.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="Admin User" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue="admin@music.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us a little about yourself"
                                    className="min-h-[100px]"
                                    defaultValue="Music platform administrator responsible for content management and user support."
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={() => handleSave("profile")}>Save Changes</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>Manage your public profile visibility and information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="public-profile">Public Profile</Label>
                                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                                </div>
                                <Switch id="public-profile" defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="show-activity">Activity Status</Label>
                                    <p className="text-sm text-muted-foreground">Show your online status and current activity</p>
                                </div>
                                <Switch id="show-activity" defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("visibility")} className="ml-auto">
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Change your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("password")} className="ml-auto">
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>Add an extra layer of security to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Recovery Codes</Label>
                                <p className="text-sm text-muted-foreground">
                                    Generate recovery codes to use if you lose access to your authentication device.
                                </p>
                                <Button variant="outline" className="mt-2">
                                    Generate Recovery Codes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Login Sessions</CardTitle>
                            <CardDescription>Manage your active login sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="rounded-md border p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">Current Session</p>
                                            <p className="text-sm text-muted-foreground">Windows 11 • Chrome • New York, USA</p>
                                            <p className="text-xs text-muted-foreground mt-1">Started 2 hours ago</p>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                                <div className="rounded-md border p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">Mobile App</p>
                                            <p className="text-sm text-muted-foreground">iOS 17 • Music App • New York, USA</p>
                                            <p className="text-xs text-muted-foreground mt-1">Last active 3 days ago</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-destructive">
                                            Revoke
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="text-destructive">
                                Sign Out All Devices
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>Choose what types of email notifications you receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>System Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about system updates and maintenance</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Security Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive emails about security events and suspicious activity
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Content Updates</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about new content and updates</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">Receive promotional emails and special offers</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("notifications")} className="ml-auto">
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Push Notifications</CardTitle>
                            <CardDescription>Configure push notifications for the admin dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New User Registrations</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Content Reports</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when content is reported by users</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>System Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about system performance and issues</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("push-notifications")} className="ml-auto">
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* System Settings */}
                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Preferences</CardTitle>
                            <CardDescription>Configure system-wide settings for the music platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="site-name">Platform Name</Label>
                                <Input id="site-name" defaultValue="Music Platform" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site-description">Platform Description</Label>
                                <Textarea
                                    id="site-description"
                                    className="min-h-[80px]"
                                    defaultValue="A platform for discovering and enjoying music from around the world."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Support Email</Label>
                                <Input id="contact-email" type="email" defaultValue="support@music.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Default Timezone</Label>
                                <Select defaultValue="utc">
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                                        <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                                        <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="language">Default Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="ja">Japanese</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("system")} className="ml-auto">
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content Settings</CardTitle>
                            <CardDescription>Configure content-related settings for the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Content Moderation</Label>
                                    <p className="text-sm text-muted-foreground">Enable automatic content moderation for user uploads</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Explicit Content Filter</Label>
                                    <p className="text-sm text-muted-foreground">Automatically flag and filter explicit content</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="upload-limit">Maximum Upload Size (MB)</Label>
                                <Input id="upload-limit" type="number" defaultValue="50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allowed-formats">Allowed Audio Formats</Label>
                                <Select defaultValue="all">
                                    <SelectTrigger id="allowed-formats">
                                        <SelectValue placeholder="Select formats" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Formats</SelectItem>
                                        <SelectItem value="mp3">MP3 Only</SelectItem>
                                        <SelectItem value="lossless">Lossless Formats Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("content")} className="ml-auto">
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Manage platform data and backups.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Database Backup</Label>
                                <p className="text-sm text-muted-foreground">Create a backup of all platform data.</p>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Export Data
                                    </Button>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Import Data
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Automatic Backups</Label>
                                <p className="text-sm text-muted-foreground">Configure automatic backup schedule.</p>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Select defaultValue="daily">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Backup frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select defaultValue="3">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Retention period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Month</SelectItem>
                                            <SelectItem value="3">3 Months</SelectItem>
                                            <SelectItem value="6">6 Months</SelectItem>
                                            <SelectItem value="12">12 Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("backup")} className="ml-auto">
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>API Settings</CardTitle>
                            <CardDescription>Manage API access and settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable API Access</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow external applications to access the platform API
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>API Keys</Label>
                                <div className="rounded-md border p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">Production API Key</p>
                                            <p className="font-mono text-sm mt-1">••••••••••••••••••••••••••••••</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                                <div className="rounded-md border p-4 mt-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">Development API Key</p>
                                            <p className="font-mono text-sm mt-1">••••••••••••••••••••••••••••••</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate-limit">API Rate Limit (requests per minute)</Label>
                                <Input id="rate-limit" type="number" defaultValue="100" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSave("api")} className="ml-auto">
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-destructive">
                        <CardHeader className="text-destructive">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>These actions are destructive and cannot be undone.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border border-destructive/20 p-4">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium">Reset Platform Data</p>
                                    <p className="text-sm text-muted-foreground">
                                        This will reset all platform data except user accounts. All content, playlists, and settings will be
                                        deleted.
                                    </p>
                                    <Button variant="outline" className="text-destructive mt-2 w-full sm:w-auto">
                                        Reset Platform Data
                                    </Button>
                                </div>
                            </div>
                            <div className="rounded-md border border-destructive/20 p-4">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium">Purge All Data</p>
                                    <p className="text-sm text-muted-foreground">
                                        This will permanently delete all data including user accounts, content, and settings. This action
                                        cannot be undone.
                                    </p>
                                    <Button variant="destructive" className="mt-2 w-full sm:w-auto">
                                        Purge All Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SettingPage