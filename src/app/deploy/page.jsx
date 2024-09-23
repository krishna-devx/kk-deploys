"use client"
import { useAuth } from '@/context/user.js'; // Adjust the import path as needed
import { Octokit } from "@octokit/rest"
import * as React from "react"

import { cloneAndBuildDocker } from "@/actions/fetchRepoContent"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function CardWithForm() {
  const [repositories, setRepositories] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { accessToken, session } = useAuth()
  const [repositryToDeploy,setRepositryToDeploy] =React.useState("")

  

  React.useEffect(() => {
    const fetchRepositories = async () => {
      if (accessToken) {
        try {
          const octokit = new Octokit({ auth: accessToken })
          const { data } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 100 // Adjust as needed
          })
          console.log("data>>>",data)
          setRepositories(data.map(repo => ({
            name: repo.name,
            fullName: repo.full_name
          })))
        } catch (error) {
          console.error("Error fetching repositories:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchRepositories()
  }, [accessToken])

  if (!session) {
    return <div>Please sign in to view this page.</div>
  }

  if (loading) {
    return <div>Loading repositories...</div>
  }

  const handleDeployment =async()=> await cloneAndBuildDocker(repositryToDeploy,session.user.name)
    
  return (
    <div className="w-full h-screen flex flex-col mt-20 items-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Name of your project" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="react">React.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="repository">Repository</Label>
                <Select onValueChange={(value) =>{console.log("captured"); setRepositryToDeploy(value)}}>
                  <SelectTrigger id="repository">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {repositories.map((repo) => (
                      <SelectItem key={repo.name} value={repo.name} >
                        {repo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="w-[130px] text-md" onClick={(e)=>handleDeployment()}>Deploy</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CardWithForm