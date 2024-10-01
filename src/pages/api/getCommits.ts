import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fromCommit, toCommit = 'HEAD', directory } = req.body;

    try {
      const command = `cd ${directory} && git log --pretty=format:%H§%s ${fromCommit}..${toCommit}`;
      const output = execSync(command, { encoding: 'utf-8' }).trim();
      const commits = output.split('\n').map(line => {
        const [hash, message] = line.split('§');
        return { hash, message };
      });
      res.status(200).json({ commits });
    } catch (error) {
      console.error('Error executing git command:', error);
      res.status(500).json({ error: 'Error executing git command. Please check your inputs and try again.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}