'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Survey {
    _id: string;
    title: string;
    questions: {
        id: string;
        text: string;
        type: string;
        options?: string[];
    }[];
}

interface Response {
    _id: string;
    surveyId: string;
    userId?: string;
    username: string;
    answers: { [key: string]: string };
    submittedAt: string;
}

interface AggregatedResponse {
    surveyId: string;
    surveyTitle: string;
    totalResponses: number;
    averageAnswers: number;
    responseDistribution: { [key: string]: number };
}

// Extend the jsPDF type to include autoTable
interface ExtendedJsPDF extends jsPDF {
    autoTable: (options: any) => void;
}

export default function SurveyAnalytics() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [responses, setResponses] = useState<Response[]>([]);
    const [aggregatedResponses, setAggregatedResponses] = useState<AggregatedResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [surveysRes, responsesRes] = await Promise.all([
                    fetch('/api/surveys'),
                    fetch('/api/responses')
                ]);
                if (!surveysRes.ok || !responsesRes.ok) throw new Error('Failed to fetch data');
                const surveysData: Survey[] = await surveysRes.json();
                const responsesData: Response[] = await responsesRes.json();
                setSurveys(surveysData);
                setResponses(responsesData);
                const aggregated = aggregateResponses(surveysData, responsesData);
                setAggregatedResponses(aggregated);
                if (aggregated.length > 0) {
                    setSelectedSurvey(aggregated[0].surveyId);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const aggregateResponses = (surveys: Survey[], responses: Response[]): AggregatedResponse[] => {
        const aggregated: { [key: string]: AggregatedResponse } = {};

        surveys.forEach(survey => {
            aggregated[survey._id] = {
                surveyId: survey._id,
                surveyTitle: survey.title,
                totalResponses: 0,
                averageAnswers: 0,
                responseDistribution: {}
            };
        });

        responses.forEach(response => {
            if (aggregated[response.surveyId]) {
                aggregated[response.surveyId].totalResponses++;
                aggregated[response.surveyId].averageAnswers += Object.keys(response.answers).length;

                Object.keys(response.answers).forEach(questionId => {
                    if (!aggregated[response.surveyId].responseDistribution[questionId]) {
                        aggregated[response.surveyId].responseDistribution[questionId] = 0;
                    }
                    aggregated[response.surveyId].responseDistribution[questionId]++;
                });
            }
        });

        return Object.values(aggregated).map(item => ({
            ...item,
            averageAnswers: item.averageAnswers / item.totalResponses || 0
        }));
    };

    const exportToPDF = () => {
        const doc = new jsPDF() as ExtendedJsPDF;
        const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey);
        const selectedSurveyData = surveys.find(s => s._id === selectedSurvey);
        const selectedResponses = responses.filter(r => r.surveyId === selectedSurvey);

        if (selectedData && selectedSurveyData) {
            doc.text(`Survey Analytics - ${selectedData.surveyTitle}`, 14, 15);
            doc.text(`Total Responses: ${selectedData.totalResponses}`, 14, 25);
            doc.text(`Average Answers per Response: ${selectedData.averageAnswers.toFixed(2)}`, 14, 35);

            // Questions and Answers Summary
            doc.text('Questions and Answers Summary:', 14, 45);
            let yOffset = 55;
            selectedSurveyData.questions.forEach((question, index) => {
                doc.text(`${index + 1}. ${question.text}`, 14, yOffset);
                yOffset += 10;
                const answerCount = selectedData.responseDistribution[question.id] || 0;
                doc.text(`   Answers: ${answerCount}`, 14, yOffset);
                yOffset += 15;
            });

            // Detailed User Responses
            yOffset += 10;
            doc.text('Detailed User Responses:', 14, yOffset);
            yOffset += 10;
            selectedResponses.forEach((response, index) => {
                doc.text(`User ${index + 1}: ${response.username}`, 14, yOffset);
                yOffset += 10;
                Object.entries(response.answers).forEach(([questionId, answer]) => {
                    const question = selectedSurveyData.questions.find(q => q.id === questionId);
                    if (question) {
                        doc.text(`   ${question.text}: ${answer}`, 14, yOffset);
                        yOffset += 10;
                    }
                });
                yOffset += 5;
                if (yOffset > 270) {
                    doc.addPage();
                    yOffset = 20;
                }
            });
        }

        doc.save(`survey_analytics_${selectedData?.surveyTitle}.pdf`);
    };

    const exportToCSV = () => {
        const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey);
        const selectedSurveyData = surveys.find(s => s._id === selectedSurvey);

        if (selectedData && selectedSurveyData) {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Question,Response Count\n";
            selectedSurveyData.questions.forEach(question => {
                const count = selectedData.responseDistribution[question.id] || 0;
                csvContent += `"${question.text}",${count}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `survey_analytics_${selectedData.surveyTitle}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey);
    const chartData = selectedData ? Object.entries(selectedData.responseDistribution).map(([questionId, count]) => {
        const question = surveys.find(s => s._id === selectedSurvey)?.questions.find(q => q.id === questionId);
        return {
            question: question ? question.text : questionId,
            count
        };
    }) : [];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Survey Responses Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{responses.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Unique Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{surveys.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Avg Answers per Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                            {(responses.reduce((sum, response) => sum + Object.keys(response.answers).length, 0) / responses.length || 0).toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Survey Selection and Export</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select value={selectedSurvey || ''} onValueChange={setSelectedSurvey}>
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select Survey" />
                            </SelectTrigger>
                            <SelectContent>
                                {aggregatedResponses.map((response) => (
                                    <SelectItem key={response.surveyId} value={response.surveyId}>
                                        {response.surveyTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={exportToPDF}>Export to PDF</Button>
                        <Button onClick={exportToCSV}>Export to CSV</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Response Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Response Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Survey</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Number of Answers</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {responses.map((response) => (
                                    <TableRow key={response._id}>
                                        <TableCell>{aggregatedResponses.find(r => r.surveyId === response.surveyId)?.surveyTitle || response.surveyId}</TableCell>
                                        <TableCell>{response.username}</TableCell>
                                        <TableCell>{new Date(response.submittedAt).toLocaleString()}</TableCell>
                                        <TableCell>{Object.keys(response.answers).length}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}