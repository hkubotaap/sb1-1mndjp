# 割り勘アプリ (Warikan App)

シンプルで使いやすい割り勘計算アプリケーション。グループでの支払いを簡単に管理・精算できます。

## 主な機能

- 👥 メンバー管理：グループのメンバーを簡単に追加・削除
- 💰 支払い記録：誰が、いくら、誰のために支払ったかを記録
- 🔄 精算計算：最適な精算方法を自動計算
- 💾 データ保存：支払い情報コードで後から精算内容を参照可能
- ⚖️ 柔軟な分配：均等割りと人数分の2種類の支払いタイプに対応
- 🧮 端数処理：切り捨て、切り上げ、四捨五入に対応

## 技術スタック

- React + TypeScript
- Tailwind CSS
- IndexedDB (データ永続化)
- Lucide Icons

## 使い方

1. メンバー登録
   - グループメンバーの名前を入力して追加
   - 2名以上のメンバーを登録すると次のステップへ進めます

2. 支払い登録
   - 支払い日、金額、支払った人を選択
   - 支払いタイプ（均等割り/人数分）を選択
   - 対象者をチェック
   - 必要に応じて支払い内容の編集・削除が可能

3. 精算
   - 支払いサマリと最適な精算方法を表示
   - 端数処理方法を選択可能（切り捨て/切り上げ/四捨五入）
   - 精算結果をクリップボードにコピー可能
   - 支払い情報コードで後から内容を参照可能

## ローカルでの実行

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```