/* Aturan wording SA. Semua jenis tryout diperlakukan sebagai satu rangkaian.
 * Ambang opsional adalah konfigurasi; bukan standar akademik yang disahkan.
 * Sumber ini juga disalin ke HTML mandiri melalui penanda TRYOUT_WORDING.
 */
const TryoutWording = (() => {
  const patterns = {
    no_data: ['Belum ada nilai', [], "Pastikan tryout yang diikuti dan ketersediaan hasilnya.", "Bahas pengalaman mengikuti tryout dan mengakses hasil, termasuk kendala jika ada.", "Lengkapi hasil yang tersedia sebelum membahas perkembangan nilai."],
    one_result: ['Baru satu nilai', [550], "Bahas persiapan dan pengalaman pengerjaan pada tryout yang tercatat.", "Identifikasi dukungan belajar yang tersedia serta kebutuhan siswa untuk tryout berikutnya.", "Catat pengalaman tryout ini sebagai konteks; perkembangan nilai menunggu hasil pembanding."],
    initial_up: ['Dua hasil: naik', [500, 550], "Bandingkan persiapan dan pengalaman pengerjaan pada dua tryout yang tercatat.", "Bahas rutinitas dan dukungan belajar di antara kedua tryout.", "Rangkum perbedaan pengalaman siswa dan hal yang ingin dievaluasi pada tryout berikutnya."],
    initial_down: ['Dua hasil: turun', [550, 500], "Bandingkan persiapan, pengalaman pengerjaan, dan pembahasan hasil pada kedua tryout.", "Bahas rutinitas belajar di antara kedua tryout, termasuk perubahan atau kendala jika ada.", "Catat temuan dari kedua tryout tanpa menyimpulkan penyebab penurunan atau pola berulang."],
    initial_flat: ['Dua hasil: tetap', [550, 550], "Bandingkan jenis soal, pengalaman pengerjaan, dan pengelolaan waktu pada kedua tryout.", "Bahas rutinitas dan dukungan belajar di antara kedua tryout.", "Rangkum persamaan dan perbedaan pengalaman siswa meskipun kedua nilai serupa."],
    steady_up: ['Naik konsisten', [500, 525, 550, 575], "Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.", "Identifikasi rutinitas dan dukungan belajar yang berlangsung selama periode tersebut.", "Rangkum cara belajar yang dinilai membantu oleh siswa serta hal yang ingin dievaluasi."],
    steady_down: ['Turun konsisten', [601, 576, 561, 546], "Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.", "Bahas kondisi dan rutinitas belajar selama periode ini, termasuk perubahan jika ada.", "Sepakati tindak lanjut berdasarkan contoh pengerjaan dan penjelasan siswa, tanpa menetapkan penyebab dari tren nilai saja."],
    steady_flat: ['Tetap sepanjang riwayat', [550, 550, 550, 550], "Bandingkan jenis soal dan cara pengerjaan antartryout, termasuk kesulitan atau perubahan yang dirasakan siswa.", "Identifikasi rutinitas, dukungan yang tersedia, dan kebutuhan belajar menurut siswa serta orang tua.", "Rangkum perkembangan dari contoh pengerjaan; nilai yang tetap belum menjelaskan penguasaan materi."],
    up_with_pauses: ['Cenderung naik, diselingi tetap', [500, 525, 525, 550], "Bandingkan persiapan dan pengalaman pada tryout dengan nilai meningkat dan nilai tetap.", "Bahas rutinitas dan dukungan belajar selama periode tersebut.", "Catat persamaan dan perbedaan pengalaman serta hal yang ingin ditinjau pada hasil berikutnya."],
    down_with_pauses: ['Cenderung turun, diselingi tetap', [600, 575, 575, 550], "Bandingkan persiapan dan pengalaman pada tryout dengan nilai menurun dan nilai tetap.", "Bahas rutinitas dan kondisi belajar selama periode tersebut, termasuk kendala jika ada.", "Sepakati fokus pembahasan berdasarkan contoh pengerjaan dan pengalaman siswa."],
    recovery: ['Terakhir berbalik naik', [600, 550, 520, 540], "Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.", "Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.", "Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu kenaikan belum menunjukkan konsistensi."],
    reversal_down: ['Terakhir berbalik turun', [500, 550, 580, 560], "Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.", "Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.", "Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu penurunan belum menunjukkan konsistensi."],
    fluctuating_up: ['Naik-turun, akhir lebih tinggi', [500, 560, 530, 550, 570], "Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah.", "Bahas rutinitas dan dukungan belajar antartryout, termasuk perbedaan jika ada.", "Rangkum persamaan dan perbedaan pengalaman di sepanjang riwayat, termasuk hal yang ingin dievaluasi."],
    fluctuating_down: ['Naik-turun, akhir lebih rendah', [600, 540, 570, 550, 530], "Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih rendah dan lebih tinggi.", "Bahas rutinitas dan kondisi belajar antartryout, termasuk kendala jika ada.", "Sepakati fokus tindak lanjut berdasarkan pengalaman siswa dan contoh pengerjaan."],
    fluctuating_flat: ['Naik-turun, kembali mendekati awal', [550, 600, 520, 530, 550, 550], "Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah di sepanjang riwayat.", "Bahas kondisi, rutinitas, dan dukungan belajar selama periode nilai naik-turun.", "Rangkum perbedaan pengalaman sepanjang riwayat; kesamaan nilai awal dan akhir belum menunjukkan kestabilan."]
  };
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const fmt = n => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });
  const day = s => {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const t = Date.parse(s + 'T00:00:00Z');
    return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === s ? t / 86400000 : null;
  };
  const positive = v => finite(v) && v > 0 ? v : null;
  function analyze(records = [], options = {}) {
    const tolerance = finite(options.tolerance) && options.tolerance >= 0 ? options.tolerance : 0;
    const large = positive(options.largeChangePoints), longGap = positive(options.longGapDays), stale = positive(options.staleAfterDays);
    const rows = records.map((r, i) => ({ ...r, index: i, day: day(r.date) }));
    const datesComplete = rows.length > 0 && rows.every(r => r.day !== null);
    if (datesComplete) rows.sort((a, b) => a.day - b.day || a.index - b.index);
    const valid = rows.filter(r => finite(r.value) && r.value >= 0), values = valid.map(r => r.value);
    const n = values.length, missing = rows.length - n;
    const sign = n => n > tolerance ? 1 : n < -tolerance ? -1 : 0;
    const changes = values.slice(1).map((v, i) => v - values[i]);
    const signs = changes.map(sign), nonzero = signs.filter(s => s !== 0);
    const net = n > 1 ? values.at(-1) - values[0] : null;
    const lastObserved = changes.length ? changes.at(-1) : null;
    const lastTwo = rows.slice(-2);
    const latestDelta = lastTwo.length === 2 && lastTwo.every(r => finite(r.value) && r.value >= 0) ? lastTwo[1].value - lastTwo[0].value : null;
    let pattern;
    if (!n) pattern = 'no_data';
    else if (n === 1) pattern = 'one_result';
    else if (n === 2) pattern = sign(net) > 0 ? 'initial_up' : sign(net) < 0 ? 'initial_down' : 'initial_flat';
    else if (!nonzero.length) pattern = 'steady_flat';
    else if (nonzero.every(s => s > 0)) pattern = signs.includes(0) ? 'up_with_pauses' : 'steady_up';
    else if (nonzero.every(s => s < 0)) pattern = signs.includes(0) ? 'down_with_pauses' : 'steady_down';
    else if (signs.at(-1) !== 0 && nonzero.at(-1) !== nonzero.at(-2)) pattern = nonzero.at(-1) > 0 ? 'recovery' : 'reversal_down';
    else pattern = sign(net) > 0 ? 'fluctuating_up' : sign(net) < 0 ? 'fluctuating_down' : 'fluctuating_flat';
    const label = options.seriesLabel || 'Skor total', lower = label.charAt(0).toLowerCase() + label.slice(1);
    const a = n ? fmt(values[0]) : '', b = n ? fmt(values.at(-1)) : '';
    const netPhrase = n > 1 ? (net < 0 ? 'turun ' : net > 0 ? 'naik ' : 'selisih ') + fmt(Math.abs(net)) + ' poin' : '';
    const flatPhrase = tolerance === 0 ? 'sama' : 'berubah dalam batas ' + fmt(tolerance) + ' poin';
    const observations = {
      no_data: 'Belum ada nilai valid untuk membaca perkembangan ' + lower + '.',
      one_result: 'Baru satu nilai ' + lower + ' tersedia, yaitu ' + a + '. Perkembangan belum dapat disimpulkan.',
      initial_up: label + ' naik dari ' + a + ' menjadi ' + b + ' (' + netPhrase + '). Baru dua hasil tersedia.',
      initial_down: label + ' turun dari ' + a + ' menjadi ' + b + ' (' + netPhrase + '). Baru dua hasil tersedia.',
      initial_flat: 'Dua nilai ' + lower + ' ' + flatPhrase + ': ' + a + ' → ' + b + '.',
      steady_up: label + ' naik ' + changes.length + ' kali berturut-turut, dari ' + a + ' menjadi ' + b + ' (' + netPhrase + ').',
      steady_down: label + ' turun ' + changes.length + ' kali berturut-turut, dari ' + a + ' menjadi ' + b + ' (' + netPhrase + ').',
      steady_flat: label + ' ' + flatPhrase + ' pada setiap perpindahan hasil yang tersedia.',
      up_with_pauses: label + ' cenderung naik, diselingi hasil yang ' + flatPhrase + '. Awal–akhir: ' + a + ' → ' + b + '.',
      down_with_pauses: label + ' cenderung turun, diselingi hasil yang ' + flatPhrase + '. Awal–akhir: ' + a + ' → ' + b + '.',
      recovery: label + ' pada hasil terakhir yang tersedia kembali naik setelah sempat turun. Awal–akhir: ' + a + ' → ' + b + '.',
      reversal_down: label + ' pada hasil terakhir yang tersedia kembali turun setelah sempat naik. Awal–akhir: ' + a + ' → ' + b + '.',
      fluctuating_up: label + ' naik-turun; nilai akhir lebih tinggi daripada awal: ' + a + ' → ' + b + '.',
      fluctuating_down: label + ' naik-turun; nilai akhir lebih rendah daripada awal: ' + a + ' → ' + b + '.',
      fluctuating_flat: label + ' naik-turun, meskipun nilai awal dan akhir ' + flatPhrase + ': ' + a + ' → ' + b + '.'
    };
    let observation = observations[pattern];
    if (n >= 3 && latestDelta !== null) observation += ' Perubahan terakhir: ' + (latestDelta > 0 ? '+' : '') + fmt(latestDelta) + ' poin.';
    const notes = [], questions = [];
    if (missing) {
      notes.push(missing + ' dari ' + rows.length + ' hasil belum tersedia atau tidak valid. Pola hanya memakai ' + n + ' nilai yang tersedia.');
      questions.push('Pastikan tryout yang diikuti dan hasil yang masih perlu dilengkapi.');
    }
    if (rows.length && !(finite(rows.at(-1).value) && rows.at(-1).value >= 0)) notes.push('Nilai tryout terakhir pada daftar belum tersedia; pola ini belum menggambarkan hasil tryout tersebut.');
    if (n >= 2 && latestDelta === null) notes.push('Perubahan terhadap tryout tepat sebelumnya belum dapat dihitung.');
    if (rows.length && !datesComplete) notes.push('Tanggal belum lengkap atau tidak valid; urutan mengikuti daftar sumber dan jeda waktu belum dinilai.');
    const largestStep = changes.length ? Math.max(...changes.map(Math.abs)) : null;
    const magnitude = { configured: large !== null, threshold: large, latestLarge: latestDelta !== null && large !== null && Math.abs(latestDelta) >= large, anyLarge: largestStep !== null && large !== null && largestStep >= large, netLarge: net !== null && large !== null && Math.abs(net) >= large };
    if (magnitude.latestLarge) {
      notes.push('Perubahan tryout terakhir mencapai ambang yang dipilih (' + fmt(large) + ' poin).');
      questions.push('Bandingkan persiapan dan pengalaman pengerjaan tryout terakhir dengan hasil sebelumnya.');
    } else if (magnitude.anyLarge) {
      notes.push('Ada perubahan antarhasil sebesar ' + fmt(largestStep) + ' poin, mencapai ambang yang dipilih (' + fmt(large) + ' poin).');
      questions.push('Bandingkan persiapan dan pengalaman pada dua tryout dengan perubahan nilai paling besar.');
    } else if (magnitude.netLarge) notes.push('Selisih awal–akhir mencapai ambang yang dipilih (' + fmt(large) + ' poin), meskipun perubahan tiap tryout lebih kecil.');
    const gaps = datesComplete ? valid.slice(1).map((r, i) => r.day - valid[i].day) : [];
    const maxGap = gaps.length ? Math.max(...gaps) : null;
    const asOf = day(options.asOf), latestDay = datesComplete && n ? valid.at(-1).day : null;
    const ageDays = asOf !== null && latestDay !== null ? asOf - latestDay : null;
    const time = { maxGapDays: maxGap, ageDays, longGap: longGap !== null && maxGap !== null && maxGap > longGap, stale: stale !== null && ageDays !== null && ageDays > stale, future: ageDays !== null && ageDays < 0, longGapThreshold: longGap, staleThreshold: stale };
    if (time.longGap) { notes.push('Jeda terpanjang antarhasil adalah ' + maxGap + ' hari, melewati batas ' + longGap + ' hari yang dipilih.'); questions.push('Bahas kegiatan dan rutinitas belajar selama jeda antartryout.'); }
    if (time.stale) { notes.push('Hasil terakhir yang tersedia sudah berusia ' + ageDays + ' hari pada tanggal acuan.'); questions.push('Pastikan ketersediaan hasil tryout terbaru dan menelusuri kondisi belajar sejak hasil terakhir.'); }
    if (time.future) notes.push('Tanggal hasil berada setelah tanggal acuan; periksa tanggal sumber sebelum menilai kebaruan.');
    const kinds = new Set(valid.map(r => r.kind).filter(k => typeof k === 'string' && k.trim() !== ''));
    const unknownKinds = valid.filter(r => typeof r.kind !== 'string' || !r.kind.trim()).length;
    const kindState = kinds.size > 1 ? 'mixed' : !n || !kinds.size ? 'unknown' : unknownKinds ? 'partial' : 'single';
    if (unknownKinds) notes.push('Jenis tryout belum terisi pada ' + unknownKinds + ' hasil; perhitungan tren tetap memakai seluruh nilai valid.');
    const typeQuestion = kindState === 'mixed' && n >= 2 ? 'Bandingkan pengalaman soal, persiapan, dan pengerjaan antarjenis tryout, termasuk persamaan atau perbedaan yang dirasakan siswa.' : '';
    const signChanges = nonzero.slice(1).filter((s, i) => s !== nonzero[i]).length;
    let student = patterns[pattern][2];
    if (pattern === 'initial_flat' && tolerance === 0) student = 'Bandingkan jenis soal, cara pengerjaan, dan pengelolaan waktu pada kedua tryout dengan nilai yang sama.';
    return {
      pattern, patternLabel: patterns[pattern][0], observation, student, parent: patterns[pattern][3], nextStep: patterns[pattern][4], notes,
      additionalQuestions: questions, typeQuestion,
      parameters: { count: rows.length, validCount: n, missingCount: missing, datesComplete, tolerance, netDelta: net, latestDelta, lastObservedDelta: lastObserved, changes, signs, signChanges, range: n ? Math.max(...values) - Math.min(...values) : null, kindState, largestStep, magnitude, time }
    };
  }
  return { analyze, patterns };
})();
