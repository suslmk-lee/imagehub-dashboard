'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/dashboard/Layout';
import RepositoryTable from '@/components/dashboard/RepositoryTable';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Repository } from '@/lib/types';

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const data = await api.getRepositories();
        setRepositories(data);
        setFilteredRepositories(data);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRepositories(repositories);
    } else {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepositories(filtered);
    }
  }, [searchQuery, repositories]);

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setFilteredRepositories(repositories);
      return;
    }

    try {
      const results = await api.searchRepositories(query);
      setFilteredRepositories(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor your container repositories
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Repository
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Repositories</div>
            <div className="text-2xl font-semibold text-gray-900">
              {filteredRepositories.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Healthy</div>
            <div className="text-2xl font-semibold text-green-600">
              {filteredRepositories.filter(r => r.status === 'healthy').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Warning</div>
            <div className="text-2xl font-semibold text-yellow-600">
              {filteredRepositories.filter(r => r.status === 'warning').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Error</div>
            <div className="text-2xl font-semibold text-red-600">
              {filteredRepositories.filter(r => r.status === 'error').length}
            </div>
          </div>
        </div>

        {/* Repositories Table */}
        <RepositoryTable repositories={filteredRepositories} isLoading={isLoading} />
      </div>
    </Layout>
  );
}