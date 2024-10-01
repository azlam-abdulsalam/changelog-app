// pages/api/getTags.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const command = 'git for-each-ref --format="%(refname:short)" refs/heads/ refs/tags/';
      const output = execSync(command, { encoding: 'utf-8' }).trim();
      const tagsAndBranches = output.split('\n');
      res.status(200).json({ tagsAndBranches });
    } catch (error) {
      console.error('Error executing git command:', error);
      res.status(500).json({ error: 'Error retrieving tags and branches.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}