import {Activity, Music2, PlaySquare, Users, TrendingUp, Clock} from "lucide-react";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "../../components/ui/tabs.tsx"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import {OverviewChart} from "../../pages/dashboard/components/OverviewChart.tsx";
import {TopArtistsTable} from "../../pages/dashboard/components/TopArtistsTable.tsx";
import useFetch from "../../hooks/use-fetch.ts";
import {DashboardData, Response} from "../../types";
import {Skeleton} from "../../components/ui/skeleton.tsx";

const DashboardPage = () => {
    const { data: dashboardResponse, loading } = useFetch<Response<DashboardData>>('api/Statistics', {
        method: 'GET',
        headers: { 'X-Custom-Header': 'value' }
    });

    console.log(dashboardResponse);

    const dashboardData = dashboardResponse?.data;

    const getPercent = (v : number) => {
        if (v > 0) return "+"+v+"%";
        return "-"+v+"%";
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your music streaming platform</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>

                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {dashboardData?.users.totalCount ?? undefined}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {getPercent(Number(dashboardData?.users.difference)) ?? undefined} from last month
                                        </p>
                                    </>
                                )}

                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Listeners</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>

                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{dashboardData?.artists.totalCount ?? undefined}</div>
                                        <p className="text-xs text-muted-foreground">{getPercent(Number(dashboardData?.artists.difference)) ?? undefined} from last month</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
                                <Music2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{dashboardData?.songs.totalCount ?? undefined}</div>
                                        <p className="text-xs text-muted-foreground">{getPercent(Number(dashboardData?.songs.difference)) ?? undefined} from last month</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
                                <PlaySquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>

                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{dashboardData?.playlists.totalCount ?? undefined}</div>
                                        <p className="text-xs text-muted-foreground">{getPercent(Number(dashboardData?.playlists.difference)) ?? undefined} from last month</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Platform activity for the past 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OverviewChart />
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Top Artists</CardTitle>
                                <CardDescription>Most streamed artists this month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopArtistsTable />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>Detailed platform analytics and insights</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <TrendingUp className="h-10 w-10 text-muted-foreground" />
                                <h3 className="text-xl font-medium">Analytics Dashboard</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Detailed analytics will be displayed here with charts, metrics, and insights about your music
                                    platform's performance.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reports</CardTitle>
                            <CardDescription>Generate and view platform reports</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Clock className="h-10 w-10 text-muted-foreground" />
                                <h3 className="text-xl font-medium">Reports Dashboard</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Generate custom reports about users, content, and platform performance. Schedule automated reports and
                                    export data.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DashboardPage