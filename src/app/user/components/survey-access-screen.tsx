import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClipboardList, CheckCircle, Clock, ArrowRight } from "lucide-react"

// This would typically come from an API or props
const surveys = [
  { id: 1, title: "Customer Satisfaction Survey", status: "pending", dueDate: "2023-12-31" },
  { id: 2, title: "Employee Engagement Survey", status: "completed", completedDate: "2023-10-15" },
  { id: 3, title: "Product Feedback Survey", status: "pending", dueDate: "2023-11-30" },
  { id: 4, title: "Website Usability Survey", status: "pending", dueDate: "2023-12-15" },
  { id: 5, title: "Training Effectiveness Survey", status: "completed", completedDate: "2023-10-01" },
]

export default function SurveyAccess() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Your Surveys</CardTitle>
        <CardDescription>View and complete surveys assigned to you</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {surveys.map((survey) => (
            <Card key={survey.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <Badge variant={survey.status === "completed" ? "secondary" : "default"}>
                    {survey.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 mr-1" />
                    )}
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {survey.status === "completed"
                      ? `Completed on ${survey.completedDate}`
                      : `Due by ${survey.dueDate}`}
                  </p>
                  <Button variant="outline" className="mt-2">
                    {survey.status === "completed" ? "View Results" : "Start Survey"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}