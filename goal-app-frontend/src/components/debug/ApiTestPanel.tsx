import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAppSelector } from '../../hooks/reduxHooks';
import { AnimatedButton } from '../common/AnimatedButton';
import { MotionCard } from '../common/MotionCard';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  response?: any;
  error?: string;
  timestamp: Date;
}

export const ApiTestPanel: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  const testEndpoint = async (endpoint: string, description: string) => {
    if (!user?.id) return;

    addTestResult({ endpoint: description, status: 'pending' });

    try {
      const response = await api.get(endpoint);
      addTestResult({
        endpoint: description,
        status: 'success',
        response: response.data
      });
    } catch (error: any) {
      addTestResult({
        endpoint: description,
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  };

  const runAllTests = async () => {
    if (!user?.id) return;

    setTesting(true);
    setTestResults([]);

    const tests = [
      [`/notifications/user/${user.id}`, 'Get All Notifications'],
      [`/notifications/user/${user.id}/unseen`, 'Get Unseen Notifications'],
      [`/notifications/user/${user.id}/unseen-count`, 'Get Unseen Count'],
      [`/challenges/pending/${user.id}`, 'Get Pending Challenges'],
      [`/challenges/sent/${user.id}`, 'Get Sent Challenges'],
      [`/goals/user/${user.id}`, 'Get User Goals'],
      [`/users/${user.id}`, 'Get User Info'],
    ];

    for (const [endpoint, description] of tests) {
      await testEndpoint(endpoint, description);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'error':
        return <XCircle className="text-red-600" size={16} />;
      case 'pending':
        return <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
        />;
    }
  };

  return (
    <MotionCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          API Test Panel
        </h3>
        <AnimatedButton
          onClick={runAllTests}
          disabled={testing || !user?.id}
          variant="primary"
          size="sm"
          className="flex items-center"
        >
          <Play size={16} className="mr-1" />
          {testing ? 'Testing...' : 'Run Tests'}
        </AnimatedButton>
      </div>

      {!user?.id && (
        <div className="text-center py-4 text-gray-500">
          Please log in to run API tests
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <motion.div
              key={`${result.endpoint}-${result.timestamp.getTime()}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 border rounded-lg ${
                result.status === 'success' ? 'bg-green-50 border-green-200' :
                result.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{result.endpoint}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {result.status === 'success' && result.response && (
                    <div className="mt-2">
                      <div className="text-xs text-green-700 mb-1">Response:</div>
                      <pre className="text-xs bg-green-100 p-2 rounded overflow-x-auto">
                        {typeof result.response === 'object' 
                          ? JSON.stringify(result.response, null, 2)
                          : result.response
                        }
                      </pre>
                    </div>
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <div className="mt-2">
                      <div className="text-xs text-red-700 mb-1">Error:</div>
                      <div className="text-xs bg-red-100 p-2 rounded">
                        {result.error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="text-sm font-semibold text-orange-800 mb-2">🔍 Diagnosis:</h4>
        <div className="text-xs text-orange-700 space-y-1">
          <div>1. If notification endpoints return empty arrays, the issue is backend</div>
          <div>2. Kafka messages are generated but not consumed by notification service</div>
          <div>3. Check if your notification service is running and consuming Kafka</div>
          <div>4. Verify database connection and notification table schema</div>
        </div>
      </div>
    </MotionCard>
  );
};