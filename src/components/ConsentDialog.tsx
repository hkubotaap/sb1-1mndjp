import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface Props {
  onConsent: () => void;
}

export default function ConsentDialog({ onConsent }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    
    if (isBottom && !canAgree) {
      setCanAgree(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">本サービスの利用について</h2>
        </div>

        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto space-y-6 max-h-[60vh]"
        >
          <section>
            <h3 className="text-lg font-semibold mb-3">本サービスの利用について</h3>
            <p className="text-gray-600">本Webアプリケーション（以下「本サービス」といいます）は、経費精算・割り勘計算を支援するツールとして提供されるものであり、計算結果を保証するものではありません。</p>
            <p className="text-gray-600">利用者は、自己の責任と判断において本サービスを利用するものとし、計算結果の確認および検証は利用者自身で行うものとします。</p>
            <p className="text-gray-600">本サービスの利用により生じた損害について、当社は、故意または重大な過失がある場合を除き、一切の責任を負わないものとします。</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">システムおよびデータの取り扱いについて</h3>
            <p className="text-gray-600">当社は、本サービスの安定的な運用に努めますが、以下の事由により生じた損害について、一切の責任を負わないものとします。</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>システム障害、保守点検、その他の技術的問題</li>
              <li>第三者による不正アクセスまたはサイバー攻撃</li>
              <li>通信回線やインターネット接続の不具合</li>
              <li>利用者の機器、ソフトウェアに起因する問題</li>
              <li>天災地変その他の不可抗力</li>
            </ul>
            <p className="text-gray-600 mt-2">データのバックアップは利用者自身の責任において行うものとします。</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">第三者提供に関する免責</h3>
            <p className="text-gray-600">利用者が本サービス上のデータを第三者と共有・提供した場合、それに起因して生じたいかなる損害についても、当社は責任を負わないものとします。</p>
            <p className="text-gray-600">利用者間のトラブルや紛争について、当社は一切関与せず、責任を負わないものとします。</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">サービスの変更および利用制限</h3>
            <p className="text-gray-600">当社は、以下の場合において、事前の通知なく本サービスの全部または一部の提供を中断、変更または終了することができるものとします。</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>システムの保守・点検が必要な場合</li>
              <li>運営上または技術上の理由でやむを得ない場合</li>
              <li>利用者が本規約に違反した場合</li>
              <li>その他、当社が必要と判断した場合</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">個人情報の取り扱いについて</h3>
            <p className="text-gray-600">当社は、本サービスの提供にあたり、必要最小限の個人情報を取得・利用します。取得した個人情報は、本サービスの提供・改善およびサポートの目的にのみ使用し、法令に基づく場合を除き、第三者への提供は行いません。</p>
          </section>

          <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            最後までお読みいただき、ありがとうございます。
            下部のチェックボックスから同意の確認をお願いいたします。
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {canAgree ? (
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">上記の利用規約とプライバシーポリシーに同意します</span>
            </label>
          ) : (
            <div className="text-sm text-gray-500 mb-4">
              ※ 規約を最後までお読みください
            </div>
          )}

          <button
            onClick={onConsent}
            disabled={!agreed}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
              agreed
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check size={20} />
            <span>同意して始める</span>
          </button>
        </div>
      </div>
    </div>
  );
}