// pages/api/gitFetch.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { directory } = req.body;

    try {
      execSync(`cd ${directory} && git fetch`, { encoding: 'utf-8' });
      res.status(200).json({ message: 'Git fetch completed successfully.' });
    } catch (error) {
      console.error('Error executing git fetch:', error);
      res.status(500).json({ error: 'Error executing git fetch. Please check your directory and try again.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}