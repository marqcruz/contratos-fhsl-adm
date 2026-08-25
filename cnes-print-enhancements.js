(function(){
  'use strict';

  function n(v){
    const x=Number(v);
    return Number.isFinite(x)?x:0;
  }
  function h(v){
    try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    catch(e){return String(v??'');}
  }
  function tipoLabel(v){
    const t=String(v??'');
    if(t==='1')return 'Administrativo';
    if(t==='2')return 'Médico';
    if(t==='3')return 'Assistencial';
    return t||'—';
  }
  function simCnes(c){
    return c.CadastradoCNES===true||String(c.CadastradoCNES).toLowerCase()==='true';
  }
  function fmtCpfSafe(v){
    try{return typeof cpf==='function'?cpf(v):String(v??'');}catch(e){return String(v??'');}
  }
  function fmtCompSafe(v){
    try{return typeof formatComp==='function'?formatComp(v):String(v??'');}catch(e){return String(v??'');}
  }

  printList=function(only){
    const ids=typeof selected==='function'?selected():[];
    const lista=only
      ? rows.filter(x=>ids.includes(String(x.ID)))
      : (typeof filtered==='function'?filtered():rows.slice());

    if(!lista.length){
      if(typeof toast==='function')toast('Nada para imprimir.','err');
      return;
    }

    const ativos=lista.filter(c=>!/^EXCLU/i.test(String(c.Status||''))).length;
    const noCnes=lista.filter(simCnes).length;
    const porTipo={
      '1':lista.filter(c=>String(c.Tipo)==='1'),
      '2':lista.filter(c=>String(c.Tipo)==='2'),
      '3':lista.filter(c=>String(c.Tipo)==='3')
    };
    const totalChTipo=t=>porTipo[t].reduce((s,c)=>s+n(c.CHAmbulatorial)+n(c.CHHospitalar)+n(c.CHOutros),0);
    const totalAmb=lista.reduce((s,c)=>s+n(c.CHAmbulatorial),0);
    const totalHosp=lista.reduce((s,c)=>s+n(c.CHHospitalar),0);
    const totalOut=lista.reduce((s,c)=>s+n(c.CHOutros),0);
    const totalGeral=totalAmb+totalHosp+totalOut;
    const agora=new Date().toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});

    const linhas=lista.map((c,i)=>{
      const amb=n(c.CHAmbulatorial),hosp=n(c.CHHospitalar),out=n(c.CHOutros),tot=amb+hosp+out;
      const conselho=[c.Conselho||'',c.NumConselho||''].filter(Boolean).join(' ');
      return `<tr>
        <td class="num">${i+1}</td>
        <td class="nome">${h(c.Nome||'')}</td>
        <td>${h(fmtCpfSafe(c.CPF))}</td>
        <td>${h(tipoLabel(c.Tipo))}</td>
        <td><b>${h(c.CBO||'')}</b>${c.CBODesc?`<span class="sub">${h(c.CBODesc)}</span>`:''}</td>
        <td>${h(conselho||'—')}</td>
        <td class="ch">${amb}</td>
        <td class="ch">${hosp}</td>
        <td class="ch">${out}</td>
        <td class="ch total">${tot}</td>
        <td>${h(fmtCompSafe(c.Competencia))}</td>
        <td>${h(c.Status||'—')}</td>
        <td class="center">${simCnes(c)?'Sim':'Não'}</td>
      </tr>`;
    }).join('');

    const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>CNES - ${h(unit)}</title><style>
      @page{size:A4 portrait;margin:8mm}
      *{box-sizing:border-box}
      html,body{margin:0;padding:0;background:#fff;color:#18202a;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-size:8.2px}
      .head{border:1px solid #b9c4cf;border-left:5px solid #1d6aad;border-radius:5px;padding:8px 10px;margin-bottom:7px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      .head h1{font-size:16px;margin:0 0 2px;color:#163f63;letter-spacing:.1px}
      .head .unit{font-size:11px;font-weight:700;margin-top:1px}
      .meta{text-align:right;color:#596674;font-size:7.5px;line-height:1.5;white-space:nowrap}
      .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:6px}
      .card{border:1px solid #c8d0d8;border-radius:4px;padding:5px 6px;background:#f7f9fb;min-height:35px}
      .card b{display:block;font-size:12px;color:#163f63;line-height:1.05;margin-bottom:2px}
      .card span{color:#5e6b77;font-size:7px}
      .tipo{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:7px}
      .tipo .box{border:1px solid #c8d0d8;border-radius:4px;padding:5px 7px;display:flex;justify-content:space-between;gap:8px;align-items:center}
      .tipo .lbl{font-weight:700;font-size:8px}.tipo .det{color:#5e6b77;font-size:7px;text-align:right}
      table{width:100%;border-collapse:collapse;table-layout:fixed}
      thead{display:table-header-group}
      tr{page-break-inside:avoid}
      th{background:#eaf0f5;color:#21384c;border:1px solid #aeb9c4;padding:4px 3px;text-align:left;font-size:6.8px;text-transform:uppercase;line-height:1.15}
      td{border:1px solid #c8d0d8;padding:3.5px 3px;vertical-align:middle;line-height:1.2;word-break:break-word}
      tbody tr:nth-child(even){background:#f8fafc}
      td.num{width:3%;text-align:center;color:#66717c}td.nome{font-weight:700}
      td.ch,th.ch{text-align:center}td.total{font-weight:700;background:#f0f5f8}.center{text-align:center}
      .sub{display:block;color:#6a7580;font-size:6.5px;margin-top:1px;font-weight:400}
      .footer{margin-top:6px;padding-top:4px;border-top:1px solid #c8d0d8;color:#6a7580;font-size:6.8px;display:flex;justify-content:space-between}
      .legend{margin:5px 0 0;color:#596674;font-size:6.8px}
      th:nth-child(1){width:3%}th:nth-child(2){width:18%}th:nth-child(3){width:9%}th:nth-child(4){width:8%}th:nth-child(5){width:10%}th:nth-child(6){width:15%}th:nth-child(7),th:nth-child(8),th:nth-child(9){width:4.5%}th:nth-child(10){width:5%}th:nth-child(11){width:6%}th:nth-child(12){width:8%}th:nth-child(13){width:5%}
      @media print{.no-print{display:none!important}}
    </style></head><body>
      <section class="head">
        <div><h1>Relatório de Cadastros CNES</h1><div class="unit">${h(unit||'Unidade não informada')}</div><div style="color:#5e6b77;margin-top:2px">TDN Gestão Operacional</div></div>
        <div class="meta">Emitido em ${h(agora)}<br>${only?'Seleção de registros':'Filtros atuais da tela'}<br>${lista.length} registro(s)</div>
      </section>

      <section class="cards">
        <div class="card"><b>${lista.length}</b><span>Registros impressos</span></div>
        <div class="card"><b>${ativos}</b><span>Ativos</span></div>
        <div class="card"><b>${noCnes}</b><span>Cadastrados no CNES</span></div>
        <div class="card"><b>${totalGeral}h</b><span>Carga horária total</span></div>
      </section>

      <section class="tipo">
        <div class="box"><div class="lbl">Administrativo</div><div class="det">${porTipo['1'].length} profissional(is)<br><b>${totalChTipo('1')}h</b> de CH</div></div>
        <div class="box"><div class="lbl">Médico</div><div class="det">${porTipo['2'].length} profissional(is)<br><b>${totalChTipo('2')}h</b> de CH</div></div>
        <div class="box"><div class="lbl">Assistencial</div><div class="det">${porTipo['3'].length} profissional(is)<br><b>${totalChTipo('3')}h</b> de CH</div></div>
      </section>

      <table>
        <thead><tr>
          <th>#</th><th>Nome</th><th>CPF</th><th>Tipo</th><th>CBO</th><th>Conselho / Registro</th>
          <th class="ch">CH<br>Amb.</th><th class="ch">CH<br>Hosp.</th><th class="ch">CH<br>Outros</th><th class="ch">CH<br>Total</th>
          <th>Compet.</th><th>Status</th><th>CNES</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
        <tfoot><tr>
          <td colspan="6" style="text-align:right;font-weight:700">TOTAL DE CARGA HORÁRIA</td>
          <td class="ch"><b>${totalAmb}</b></td><td class="ch"><b>${totalHosp}</b></td><td class="ch"><b>${totalOut}</b></td><td class="ch total"><b>${totalGeral}</b></td>
          <td colspan="3"></td>
        </tr></tfoot>
      </table>
      <div class="legend">CH Amb. = carga horária ambulatorial · CH Hosp. = carga horária hospitalar.</div>
      <div class="footer"><span>Relatório CNES — ${h(unit||'')}</span><span>${lista.length} registro(s)</span></div>
      <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));<\/script>
    </body></html>`;

    const w=window.open('','_blank');
    if(!w){
      if(typeof toast==='function')toast('O navegador bloqueou a janela de impressão. Libere pop-ups para o TDNGo.','err');
      return;
    }
    w.document.open();w.document.write(html);w.document.close();
  };
})();
