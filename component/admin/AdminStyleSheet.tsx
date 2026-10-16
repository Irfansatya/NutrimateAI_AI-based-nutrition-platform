export default function AdminStyleSheet() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap');

      :root {
        --g: #05976a;
        --gh: #047a56;
        --gl: #e9f6f1;
        --t: #121517;
        --s: #5b5f66;
        --m: #8a9099;
        --b: #e6e9f0;
        --bg: #f1f3f9;
        --f: #f7f8fa;
        --mint: #4fe3b4;
      }

      * {
        box-sizing: border-box;
        margin: 0;
      }

      body {
        font-family: 'Google Sans Flex', 'Google Sans', system-ui, -apple-system,
          'Segoe UI', sans-serif;
        font-optical-sizing: auto;
        color: var(--t);
        background: #fff;
        font-size: 15px;
      }

      button,
      input,
      textarea {
        font: inherit;
        color: inherit;
      }

      button {
        cursor: pointer;
        border: 0;
        background: none;
      }

      svg {
        display: block;
      }

      :focus-visible {
        outline: 2px solid var(--g);
        outline-offset: 2px;
      }

      .wr {
        width: min(1340px, 100% - 48px);
        margin: 0 auto;
      }

      /* ===== Header gelap ===== */
      .top {
        background: var(--t);
        color: #fff;
        padding-bottom: 140px;
      }
      .bar {
        display: flex;
        align-items: center;
        min-height: 80px;
        gap: 70px;
      }
      .lg {
        height: 30px;
        width: auto;
        flex: none;
      }
      .nv {
        display: flex;
        gap: 35px;
      }
      .nv button {
        padding: 8px 0;
        font-size: 17px;
        font-weight: 500;
        color: #8e9399;
        transition: color 0.15s;
      }
      .nv button:hover {
        color: #fff;
      }
      .nv .on {
        color: #fff;
      }
      .me {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .pf {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 6px 40px 6px 6px;
        border: 1px solid rgba(255, 255, 255, 0.26);
        border-radius: 999px;
        background: #1b1f22;
      }
      .av {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #d9f7eb;
        color: var(--g);
        display: grid;
        place-items: center;
        flex: none;
      }
      .av svg {
        width: 20px;
        height: 20px;
      }
      .pf b {
        display: block;
        font-weight: 500;
        font-size: 16px;
        line-height: 1.2;
      }
      .pf small {
        display: block;
        color: #8e9399;
        font-size: 14px;
        line-height: 1.3;
      }
      .lo {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #fff;
        color: var(--t);
        display: grid;
        place-items: center;
        transition: background 0.15s, transform 0.15s;
      }
      .lo svg {
        width: 20px;
        height: 20px;
      }
      .lo:hover {
        background: #d9f7eb;
      }
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        margin-top: 30px;
        flex-wrap: wrap;
      }
      .ht h1 {
        font-size: 40px;
        font-weight: 600;
        letter-spacing: -0.8px;
        line-height: 1.15;
      }
      .ht p {
        color: #8e9399;
        font-size: 17px;
        margin-top: 4px;
      }
      .hs {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .hc {
        min-width: 240px;
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: end;
        column-gap: 20px;
        padding: 16px 16px 14px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 16px;
      }
      .hc small {
        grid-column: 1/3;
        font-size: 15.5px;
        color: #fff;
      }
      .hc b {
        font-size: 40px;
        font-weight: 500;
        letter-spacing: -1px;
        line-height: 1.15;
        margin-top: 2px;
      }
      .hc span {
        justify-self: end;
        font-size: 13.5px;
        color: var(--mint);
        padding-bottom: 6px;
        font-weight: 500;
      }
      .hc.hl {
        background: linear-gradient(
          105deg,
          #3c3f42 0%,
          #707274 55%,
          #4a4c4f 100%
        );
        border-color: rgba(255, 255, 255, 0.28);
      }

      /* ===== Panel ===== */
      .panel {
        background: var(--bg);
        border-radius: 26px;
        padding: 36px;
        margin-top: -105px;
        position: relative;
        margin-bottom: 60px;
        min-height: 420px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 20px;
      }
      .c {
        background: #fff;
        border: 1px solid var(--b);
        border-radius: 20px;
        padding: 22px;
      }
      .c.k {
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 28px 24px;
      }
      .ic {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: var(--gl);
        color: var(--g);
        display: grid;
        place-items: center;
        flex: none;
      }
      .ic svg {
        width: 21px;
        height: 21px;
      }
      .c.k small {
        display: block;
        font-size: 14px;
        color: #2b2f33;
      }
      .c.k .n {
        display: block;
        font-size: 32px;
        font-weight: 700;
        line-height: 1.2;
        margin: 2px 0;
      }
      .c.k .h {
        font-size: 14px;
        color: #2b2f33;
      }
      h2 {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.2px;
        margin-bottom: 14px;
      }
      .two {
        display: grid;
        grid-template-columns: 1.62fr 1fr;
        gap: 20px;
      }
      .act {
        display: flex;
        gap: 14px;
        padding: 14px 0;
        border-bottom: 1px solid var(--b);
      }
      .act:first-of-type {
        padding-top: 6px;
      }
      .act:last-child {
        border: 0;
        padding-bottom: 4px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--g);
        margin-top: 7px;
        flex: none;
      }
      .act p {
        line-height: 1.45;
        font-size: 16px;
      }
      .act small {
        color: var(--s);
        font-size: 13px;
      }

      /* ===== Komponen umum ===== */
      .seg {
        display: inline-flex;
        gap: 4px;
        background: #fff;
        border: 1px solid var(--b);
        padding: 4px;
        border-radius: 999px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .seg button {
        padding: 8px 18px;
        border-radius: 999px;
        font-weight: 500;
        color: var(--s);
        transition: background 0.15s;
      }
      .seg button:hover {
        background: var(--f);
      }
      .seg .on,
      .seg .on:hover {
        background: var(--t);
        color: #fff;
      }
      .bd {
        display: inline-block;
        padding: 3px 11px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 500;
        background: #eef0f4;
        color: var(--s);
        white-space: nowrap;
      }
      .bd.ok {
        background: var(--gl);
        color: #04684a;
      }
      .bd.warn {
        background: #fff4db;
        color: #8a5a00;
      }
      .bd.bad {
        background: #fde7e5;
        color: #b42318;
      }
      .bd.info {
        background: #e6f0ff;
        color: #1d4ed8;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 16px;
        align-items: center;
        background: #fff;
        border: 1px solid var(--b);
        border-radius: 20px;
        padding: 18px 22px;
        margin-bottom: 12px;
      }
      .row h3 {
        font-size: 17px;
        font-weight: 600;
        margin: 6px 0 4px;
      }
      .row p {
        color: var(--s);
        font-size: 14px;
        line-height: 1.5;
      }
      .mini {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        font-size: 13px;
        color: var(--s);
      }
      .mini .pg {
        width: 180px;
        height: 7px;
      }
      .btn {
        padding: 10px 22px;
        border-radius: 999px;
        font-weight: 500;
        background: var(--g);
        color: #fff;
        transition: background 0.15s;
      }
      .btn:hover {
        background: var(--gh);
      }
      .btn.o {
        background: #fff;
        color: var(--t);
        border: 1px solid #d5d9e1;
      }
      .btn.o:hover {
        background: var(--f);
      }
      .btn.w {
        background: #f59e0b;
      }
      .btn.w:hover {
        background: #d98a06;
      }
      .btn.r {
        background: #d92d20;
      }
      .btn.r:hover {
        background: #b42318;
      }
      .btn:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .pg {
        height: 10px;
        border-radius: 99px;
        background: #e3e8ee;
        overflow: hidden;
      }
      .pg i {
        display: block;
        height: 100%;
        background: var(--g);
        border-radius: 99px;
      }
      .lb {
        display: block;
        color: var(--s);
        font-size: 13.5px;
        margin: 16px 0 6px;
      }
      .msg {
        background: var(--f);
        border: 1px solid #eef0f4;
        border-radius: 14px;
        padding: 14px 16px;
        line-height: 1.65;
        white-space: pre-wrap;
      }
      .docs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .doc {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--gl);
        color: #04684a;
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 13.5px;
        font-weight: 500;
        transition: background 0.15s;
      }
      .doc:hover {
        background: #d5efe5;
      }
      .doc svg {
        width: 16px;
        height: 16px;
        flex: none;
      }
      .doc span {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .hint {
        font-size: 12.5px;
        color: var(--m);
        margin-top: 6px;
      }
      .mut {
        color: var(--m);
      }
      .em {
        color: #d92d20;
        font-size: 13px;
        min-height: 18px;
        margin: 6px 0;
      }
      textarea,
      .in {
        width: 100%;
        background: var(--f);
        border: 1px solid var(--b);
        border-radius: 12px;
        padding: 12px 14px;
        outline: 0;
        min-height: 44px;
      }
      textarea {
        min-height: 130px;
        resize: vertical;
        line-height: 1.55;
      }
      textarea:focus,
      .in:focus {
        border-color: var(--g);
        box-shadow: 0 0 0 3px rgba(5, 151, 106, 0.14);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0 6px;
      }
      th,
      td {
        text-align: left;
        padding: 9px 6px;
        border-bottom: 1px solid var(--b);
        font-size: 14px;
      }
      td:last-child,
      th:last-child {
        text-align: right;
      }
      th {
        color: var(--s);
        font-weight: 500;
      }

      /* ===== Toast Notification Terbaru ===== */
      .toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        color: var(--t);
        padding: 12px 22px;
        border-radius: 999px;
        z-index: 999;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--b);
        box-shadow: 0 10px 25px -5px rgba(18, 21, 23, 0.12),
          0 8px 10px -6px rgba(18, 21, 23, 0.08);
      }

      /* ===== Popup ===== */
      .md {
        position: fixed;
        inset: 0;
        background: rgba(18, 21, 23, 0.55);
        display: grid;
        place-items: center;
        padding: 16px;
        z-index: 50;
      }
      .mc {
        background: #fff;
        border-radius: 22px;
        width: 100%;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(18, 21, 23, 0.28);
      }
      .mb {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        margin: 14px 8px 0 0;
        padding: 12px 14px 12px 26px;
        scrollbar-width: thin;
        scrollbar-color: #c9cfd8 transparent;
      }
      .mb::-webkit-scrollbar {
        width: 12px;
      }
      .mb::-webkit-scrollbar-track {
        background: transparent;
      }
      .mb::-webkit-scrollbar-thumb {
        background: #c9cfd8;
        border-radius: 99px;
        border: 3px solid transparent;
        background-clip: padding-box;
      }
      .mb::-webkit-scrollbar-thumb:hover {
        background: #a9b1bd;
        background-clip: padding-box;
        border: 3px solid transparent;
      }
      .mf {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        padding: 14px 26px 22px;
        border-top: 1px solid var(--b);
      }
      .mb h2 {
        font-size: 22px;
        margin: 8px 0 0;
      }
      .g2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 20px;
        margin: 16px 0 4px;
      }
      .g2 small {
        color: var(--s);
        display: block;
        font-size: 13.5px;
        margin-bottom: 2px;
      }
      .chk {
        display: grid;
        gap: 8px;
        margin: 18px 0 12px;
      }
      .chk label {
        display: flex;
        gap: 10px;
        align-items: center;
        background: var(--f);
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;
      }
      .chk input {
        accent-color: var(--g);
        width: 17px;
        height: 17px;
      }
      .fund {
        margin: 16px 0 4px;
        padding: 16px;
        border: 1px solid var(--b);
        border-radius: 14px;
        background: var(--f);
      }
      .fund .fh {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .fund .fh b {
        font-size: 20px;
        color: var(--g);
      }
      .fund .fs {
        font-size: 13.5px;
        color: var(--s);
        margin-top: 8px;
      }
      .fund .fs b {
        color: var(--t);
      }
      .cf {
        padding: 8px 4px 4px;
        text-align: center;
      }
      .cfi {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--gl);
        color: var(--g);
        display: grid;
        place-items: center;
        margin: 6px auto 14px;
      }
      .cfi svg {
        width: 24px;
        height: 24px;
      }
      .cf h2 {
        margin: 0 0 6px;
      }
      .cf p {
        color: var(--s);
        line-height: 1.5;
      }

      /* ===== Pesan Pengguna ===== */
      .ms {
        display: grid;
        grid-template-columns: 390px 1fr;
        gap: 20px;
        align-items: start;
      }
      .sr {
        position: relative;
        display: block;
        margin-bottom: 12px;
      }
      .sr svg {
        position: absolute;
        left: 14px;
        top: 12px;
        width: 18px;
        height: 18px;
        color: var(--m);
      }
      .sr .in {
        padding-left: 42px;
        background: #fff;
        border-radius: 999px;
      }
      .ms > div {
        min-width: 0;
      }
      .ms .seg {
        display: flex;
        width: 100%;
      }
      .ms .seg button {
        flex: 1;
        padding: 8px 6px;
        font-size: 13.5px;
        white-space: nowrap;
      }
      .ml {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
        max-height: 640px;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: #c9cfd8 transparent;
      }
      .ml::-webkit-scrollbar {
        width: 8px;
      }
      .ml::-webkit-scrollbar-thumb {
        background: #c9cfd8;
        border-radius: 99px;
      }
      .mi {
        display: block;
        width: 100%;
        text-align: left;
        background: #fff;
        border: 1px solid var(--b);
        border-radius: 16px;
        padding: 14px 16px;
        transition: border-color 0.15s;
      }
      .mi:hover {
        border-color: #c9cfd8;
      }
      .mi.on {
        border-color: var(--g);
        box-shadow: 0 0 0 1px var(--g);
      }
      .mi .r1 {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: baseline;
      }
      .mi b {
        font-weight: 600;
      }
      .mi.rd b {
        font-weight: 500;
      }
      .mi small {
        color: var(--m);
        font-size: 12.5px;
        white-space: nowrap;
      }
      .mi p {
        color: var(--s);
        font-size: 13.5px;
        margin: 4px 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mi .r3 {
        display: flex;
        gap: 6px;
      }
      .dh {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }
      .dh h2 {
        margin-bottom: 2px;
      }
      .dh a {
        color: var(--g);
        text-decoration: none;
        font-size: 14.5px;
      }
      .dh a:hover {
        text-decoration: underline;
      }
      .rep {
        border-top: 1px solid var(--b);
        margin-top: 22px;
        padding-top: 6px;
      }
      .rep .sub {
        display: block;
        margin-bottom: 10px;
      }
      .ft {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .ft span {
        font-size: 13px;
        color: var(--m);
      }
      .sent {
        background: var(--gl);
        border-color: #cdebdd;
      }
      .empty {
        padding: 36px 10px;
        text-align: center;
        color: var(--s);
      }

      /* ===== Login ===== */
      .lg2 {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fff;
        padding: 20px;
      }
      .lc {
        width: 100%;
        max-width: 400px;
        border: 1px solid #edeff3;
        border-radius: 16px;
        padding: 44px 40px 36px;
        text-align: center;
        box-shadow: 0 8px 40px rgba(16, 24, 40, 0.05);
      }
      .mk {
        width: 60px;
        height: 60px;
        border-radius: 14px;
        margin: 0 auto 26px;
        box-shadow: 0 4px 18px rgba(16, 24, 40, 0.12);
        display: grid;
        place-items: center;
      }
      .lc h1 {
        font-size: 26px;
        font-weight: 500;
      }
      .lc p.s {
        color: #9aa0a8;
        margin: 8px 0 26px;
        font-size: 13px;
        line-height: 1.5;
      }
      .lc .in {
        margin-bottom: 12px;
        border-radius: 8px;
      }
      .pw {
        position: relative;
      }
      .pw .in {
        padding-right: 46px;
      }
      .pw button {
        position: absolute;
        right: 6px;
        top: 4px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: #8a9099;
        display: grid;
        place-items: center;
      }
      .pw button:hover {
        color: var(--t);
        background: #eef0f4;
      }
      .pw button svg {
        width: 20px;
        height: 20px;
      }
      .lc .btn {
        width: 100%;
        border-radius: 999px;
        padding: 13px;
        background: var(--g);
        margin-top: 2px;
      }
      .lc .btn:hover {
        background: var(--gh);
      }
      .lc .em {
        text-align: left;
        margin: 0 0 8px;
      }
      .lc small {
        display: block;
        color: #8a8f98;
        font-size: 12px;
        margin-top: 20px;
        line-height: 1.6;
      }

      @media (max-width: 1100px) {
        .bar {
          flex-wrap: wrap;
          gap: 12px 40px;
          padding: 14px 0;
        }
        .nv {
          order: 3;
          width: 100%;
          gap: 26px;
          overflow-x: auto;
        }
        .me {
          margin-left: auto;
        }
        .pf small {
          display: none;
        }
        .pf {
          padding-right: 24px;
        }
      }
      @media (max-width: 900px) {
        .cards,
        .two,
        .ms,
        .g2 {
          grid-template-columns: 1fr;
        }
        .panel {
          padding: 18px;
          border-radius: 22px;
        }
        .ht h1 {
          font-size: 32px;
        }
        .hs {
          width: 100%;
        }
        .hc {
          flex: 1 1 220px;
        }
        .row {
          grid-template-columns: 1fr;
        }
        .top {
          padding-bottom: 130px;
        }
      }
      @media (max-width: 480px) {
        .pf > div {
          display: none;
        }
        .pf {
          padding: 6px;
        }
      }
    `
      }}
    />
  );
}