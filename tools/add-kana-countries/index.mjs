import kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import fs from 'fs';
const countriesData = JSON.parse(fs.readFileSync('./countries.json', 'utf8'));
const kuro = new kuroshiro();
let result = [];
(async () => {
    await kuro.init(new KuromojiAnalyzer());
    result = await Promise.all(countriesData.map(async x => {
        x.translations.jpn_kana =
        {
            official: kana2Hira(await kuro.convert(
            x?.translations?.jpn?.official ?? x.name.official,
                { to: "hiragana" })),
            common: kana2Hira(await kuro.convert(
            x?.translations?.jpn?.common ?? x.name.common,
                { to: "hiragana" }))
        };
        //console.log((x?.translations?.jpn?.common ?? x.name.common) + " -> " + x.translations.jpn_kana);
        // console.log(x);
        return x;
    }));
    fs.writeFileSync('../../packages/renderer/assets/countries_kana.json', JSON.stringify(result));
})();
//console.log(result);

function kana2Hira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}
