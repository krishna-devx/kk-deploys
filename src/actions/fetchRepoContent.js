"use server";

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      resolve(stdout);
    });
  });
}

export async function cloneAndBuildDocker(repoName,username ,branch = 'main') {
  const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
  const dockerfilePath = path.join(tempDir, 'Dockerfile');
  const repoUrl = `https://github.com/${username}/${repoName}`
  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });

    // Clone the repository
    console.log(`Cloning repository: ${repoUrl}`);
    await execCommand(`git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`);

    // Check if Dockerfile exists, if not, create a simple one
  
      console.log('Dockerfile not found, creating a default one');
      const defaultDockerfile = `
        FROM node:14
        WORKDIR /app
        COPY package*.json ./
        RUN npm install
        COPY . .
        EXPOSE 3000
        CMD ["npm", "start"]
      `;
      await fs.writeFile(dockerfilePath, defaultDockerfile);
    

    // Build Docker image
    const imageName = `myapp:${Date.now()}`;
    console.log(`Building Docker image: ${imageName}`);
    await execCommand(`docker build -t ${imageName} ${tempDir}`);

    console.log(`Docker image built successfully: ${imageName}`);
    return imageName;
  } catch (error) {
    console.error('Error in cloning repository or building Docker image:', error);
    throw error;
  } 
}
// import { Octokit } from "@octokit/rest";

// async function fetchRepoContents(accessToken, owner, repo) {
//   console.log(accessToken,owner,repo)
//   const octokit = new Octokit({ auth: accessToken });

//   async function getContents(path = "") {
//     try {
//       const { data } = await octokit.repos.getContent({
//         owner,
//         repo,
//         path,
//       });
// console.log("data>>",data)
//       console.log("Fetched data for path:", path);

//       let files = [];

//       if (Array.isArray(data)) {
//         for (const item of data) {
//           if (item.type === "file") {
//             try {
//               const { data: fileData } = await octokit.repos.getContent({
//                 owner,
//                 repo,
//                 path: item.path,
//               });
//               files.push({
//                 path: item.path,
//                 content: Buffer.from(fileData.content, "base64").toString("utf-8"),
//               });
//             } catch (error) {
//               console.error(`Error fetching file content for ${item.path}:`, error.message);
//             }
//           } else if (item.type === "dir") {
//             files = files.concat(await getContents(item.path));
//           }
//         }
//       } else if (data.type === "file") {
//         files.push({
//           path: path,
//           content: Buffer.from(data.content, "base64").toString("utf-8"),
//         });
//       }

//       return files;
//     } catch (error) {
//       console.error(`Error fetching contents for path ${path}:`, error.message);
//       if (error.status === 404) {
//         console.error("Repository not found or no access. Please check the repository name and your permissions.");
//       }
//       return [];
//     }
//   }

//   return getContents();
// }

// export default fetchRepoContents;

// import fs from 'fs/promises';
// import path from 'path';
// import os from 'os';

// async function storeRepoContents(files) {
//   const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-'));

//   for (const file of files) {
//     const filePath = path.join(tempDir, file.path);
//     await fs.mkdir(path.dirname(filePath), { recursive: true });
//     await fs.writeFile(filePath, file.content);
//   }

//   return tempDir;
// }

// import { exec } from 'child_process';
// import util from 'util';
// import fs from 'fs/promises';
// import path from 'path';

// const execAsync = util.promisify(exec);

// async function createDockerfile(projectPath) {
//   const dockerfileContent = `
// FROM node:18-alpine

// WORKDIR /app

// COPY package*.json ./

// RUN npm ci

// COPY . .

// RUN npm run build

// EXPOSE 3000

// CMD ["npm", "start"]
// `;

//   await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);
// }

// async function buildDockerImage(projectPath, imageName) {
//   try {
//     await createDockerfile(projectPath);

//     const { stdout, stderr } = await execAsync(`docker build -t ${imageName} ${projectPath}`);
//     console.log('Docker build output:', stdout);
//     if (stderr) {
//       console.error('Docker build errors:', stderr);
//     }
//     return imageName;
//   } catch (error) {
//     console.error('Error building Docker image:', error);
//     throw error;
//   }
// }

// import { getSession } from "next-auth/react";
// import { fetchRepoContents } from "../../utils/github";
// import { storeRepoContents } from "../../utils/storage";
// import { buildDockerImage } from "../../utils/docker";
// import fs from 'fs/promises';

// export default async function handler(req, res) {
//   const session = await getSession({ req });

//   if (!session) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { owner, repo } = req.body;

//   try {
//     // Fetch repository contents
//     const files = await fetchRepoContents(session.accessToken, owner, repo);

//     // Store repository contents
//     const tempDir = await storeRepoContents(files);

//     // Build Docker image
//     const imageName = `${owner}-${repo}:latest`;
//     await buildDockerImage(tempDir, imageName);

//     // Clean up temporary directory
//     await fs.rm(tempDir, { recursive: true, force: true });

//     res.status(200).json({ message: "Repository deployed successfully", imageName });
//   } catch (error) {
//     console.error('Error in deployment process:', error);
//     res.status(500).json({ error: "Failed to deploy repository" });
//   }
// }



// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';

// export default function RepoSelector() {
//   const { data: session } = useSession();
//   const [repos, setRepos] = useState([]);
//   const [selectedRepo, setSelectedRepo] = useState(null);
//   const [deploymentStatus, setDeploymentStatus] = useState(null);

//   useEffect(() => {
//     async function loadRepos() {
//       if (session?.accessToken) {
//         try {
//           const repoList = await fetchUserRepositories(session.accessToken);
//           setRepos(repoList);
//         } catch (error) {
//           console.error('Failed to load repositories:', error);
//         }
//       }
//     }
//     loadRepos();
//   }, [session]);

//   const handleRepoSelect = (repo) => {
//     setSelectedRepo(repo);
//   };

//   const deployRepo = async () => {
//     if (!selectedRepo) return;

//     setDeploymentStatus('Deploying...');

//     try {
//       const response = await fetch('/api/deploy-repo', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           owner: selectedRepo.owner.login,
//           repo: selectedRepo.name
//         })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setDeploymentStatus(`Deployed successfully. Image: ${data.imageName}`);
//       } else {
//         setDeploymentStatus('Deployment failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Deployment error:', error);
//       setDeploymentStatus('Deployment failed due to an error. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <h2>Select a repository to deploy</h2>
//       <ul>
//         {repos.map(repo => (
//           <li key={repo.id}>
//             <button onClick={() => handleRepoSelect(repo)}>
//               {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
//             </button>
//           </li>
//         ))}
//       </ul>
//       {selectedRepo && (
//         <div>
//           <h3>Selected Repository: {selectedRepo.full_name}</h3>
//           <button onClick={deployRepo}>Deploy this repository</button>
//         </div>
//       )}
//       {deploymentStatus && <p>{deploymentStatus}</p>}
//     </div>
//   );
// }
