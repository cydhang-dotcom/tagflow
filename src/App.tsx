/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './store/useStore';
import { MainContent } from './components/MainContent';

export default function App() {
  return (
    <AppProvider>
      <div className="flex h-[100dvh] w-full flex-col bg-[#F5F5F7] font-sans text-[#1D1D1F] overflow-hidden selection:bg-indigo-200">
        <MainContent />
      </div>
    </AppProvider>
  );
}

