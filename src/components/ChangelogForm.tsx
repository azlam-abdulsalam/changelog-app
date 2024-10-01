'use client';

import React, { useState, useEffect } from 'react';

interface Commit {
  hash: string;
  message: string;
}

interface TicketInfo {
  hash: string;
  tickets: string[];
}

export default function ChangelogForm() {
  const [fromCommit, setFromCommit] = useState('');
  const [toCommit, setToCommit] = useState('');
  const [directory, setDirectory] = useState('');
  const [jiraHost, setJiraHost] = useState('');
  const [jiraRegex, setJiraRegex] = useState('(ABC-\\d+)|(XYZ-\\d+)');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo[]>([]);
  const [error, setError] = useState('');
  const [tagsAndBranches, setTagsAndBranches] = useState<string[]>([]);

  useEffect(() => {
    const fetchTagsAndBranches = async () => {
      try {
        const response = await fetch('/api/getTags');
        if (response.ok) {
          const data = await response.json();
          setTagsAndBranches(data.tagsAndBranches);
        }
      } catch (error) {
        console.error('Error fetching tags and branches:', error);
      }
    };

    fetchTagsAndBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const [commitResponse, ticketResponse] = await Promise.all([
        fetch('/api/getCommits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromCommit, toCommit, directory }),
        }),
        fetch('/api/getTickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromCommit, toCommit, directory, jiraRegex }),
        }),
      ]);

      if (!commitResponse.ok || !ticketResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const commitData = await commitResponse.json();
      const ticketData = await ticketResponse.json();

      setCommits(commitData.commits);
      setTicketInfo(ticketData.ticketInfo);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please check your inputs and try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Changelog Generator</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <input
              type="text"
              id="fromCommit"
              value={fromCommit}
              onChange={(e) => setFromCommit(e.target.value)}
              placeholder="From Commit"
              className="w-full px-3 py-1 pr-8 bg-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={fromCommit}
              onChange={(e) => setFromCommit(e.target.value)}
              className="absolute right-0 top-0 bottom-0 px-1 py-1 border-l bg-black rounded-r-md focus:outline-none"
            >
              <option value="">Select</option>
              {tagsAndBranches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              id="toCommit"
              value={toCommit}
              onChange={(e) => setToCommit(e.target.value)}
              placeholder="To Commit (optional)"
              className="w-full px-3 py-1 pr-8 border bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={toCommit}
              onChange={(e) => setToCommit(e.target.value)}
              className="absolute right-0 top-0 bottom-0 px-1 py-1 border-l bg-black rounded-r-md focus:outline-none"
            >
              <option value="">Select</option>
              {tagsAndBranches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            id="directory"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            placeholder="Local Directory"
            className="px-3 py-1 border rounded-md bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            id="jiraHost"
            value={jiraHost}
            onChange={(e) => setJiraHost(e.target.value)}
            placeholder="Jira Host"
            className="px-3 py-1 border rounded-md  bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            id="jiraRegex"
            value={jiraRegex}
            onChange={(e) => setJiraRegex(e.target.value)}
            placeholder="Jira Ticket Regex"
            className="px-3 py-1 border rounded-md  bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded">
          Generate Changelog
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {commits.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Commit Messages</h2>
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {commits.map((commit) => (
                <li key={commit.hash} className="p-4 bg-gray-100 rounded-md">
                  <div className="font-semibold text-gray-800 mb-2">
                    <span className="font-mono bg-gray-200 rounded-md px-2 py-1 mr-2">{commit.hash.substring(0, 7)}</span>
                    {commit.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ticketInfo.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Jira Tickets</h2>
            <ul className="space-y-6 max-h-96 overflow-y-auto">
              {ticketInfo.map((info) => (
                <li key={info.hash} className="p-4 bg-gray-100 rounded-md">
                  <div className="font-semibold text-gray-800 mb-2">
                    <span className="font-mono bg-gray-200 rounded-md px-2 py-1 mr-2">{info.hash.substring(0, 7)}</span>
                  </div>
                  {info.tickets.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {info.tickets.map((ticket) => (
                        <li key={ticket}>
                          <a
                            href={`https://${jiraHost}/browse/${ticket}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {ticket}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No tickets found</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}