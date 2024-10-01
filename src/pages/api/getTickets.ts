import { execSync } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fromCommit, toCommit, directory, jiraRegex } = req.body;

    try {
      const command = `cd ${directory} && git log --pretty=format:%H§%s ${fromCommit}..${toCommit}`;
      const output = execSync(command, { encoding: 'utf-8' }).trim();
      const jiraTicketRegex = new RegExp(jiraRegex, 'g');
      const ticketInfo = output.split('\n').map(line => {
        const [hash, message] = line.split('§');
        const tickets = message.match(jiraTicketRegex) || []; // Error occurs here
        return { hash, tickets };
      });
      res.status(200).json({ ticketInfo });
    } catch (error) {
      console.error('Error executing git command:', error);
      res.status(500).json({ error: 'Error executing git command or parsing Jira tickets. Please check your inputs and try again.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}