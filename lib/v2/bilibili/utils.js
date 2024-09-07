/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
/* eslint-disable unicorn/consistent-function-scoping */
// const CryptoJS = require('crypto-js');
const got = require('@/utils/got');
const { DOMParser } = require('xmldom');

function iframe(aid, page, bvid) {
    return `<iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
}

function asyncSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function get_buvid3_and_b_nut(ua) {
    const res = await got('https://www.bilibili.com', {
        headers: {
            'User-Agent': ua,
        },
    });
    const cookie = {};
    for (const cookieDetail of res.headers['set-cookie']) {
        const kv = cookieDetail.split(';')[0].split('=');
        cookie[kv[0]] = kv[1];
    }
    return cookie;
}

function generate_b_lsid() {
    function splitDate(e) {
        const t = new Date(e || Date.now()),
            r = t.getDate(),
            n = t.getHours(),
            o = t.getMinutes(),
            i = t.getTime();
        return {
            day: r,
            hour: n,
            minute: o,
            second: Math.floor(i / 1e3),
            millisecond: i,
        };
    }

    function a(e) {
        return Math.ceil(e).toString(16).toUpperCase();
    }

    function o(e) {
        let t = '';
        for (let r = 0; r < e; r++) {
            t += a(16 * Math.random());
        }
        return i(t, e);
    }

    function i(e, t) {
        let r = '';
        if (e.length < t) {
            for (let n = 0; n < t - e.length; n++) {
                r += '0';
            }
        }
        return r + e;
    }

    function generate() {
        const e = splitDate();
        const t = (0, a)(e.millisecond),
            r = ''.concat((0, o)(8), '_').concat(t);
        return r;
    }

    return generate();
}

function generate_uuid() {
    function n() {
        function o(e) {
            function a(e) {
                return Math.ceil(e).toString(16).toUpperCase();
            }
            let t = '';
            for (let r = 0; r < e; r++) {
                t += a(16 * Math.random());
            }
            return i(t, e);
        }
        const e = o(8),
            t = o(4),
            r = o(4),
            n = o(4),
            a = o(12),
            s = Date.now();
        return e + '-' + t + '-' + r + '-' + n + '-' + a + i((s % 1e5).toString(), 5) + 'infoc';
    }

    function i(e, t) {
        let r = '';
        if (e.length < t) {
            for (let n = 0; n < t - e.length; n++) {
                r += '0';
            }
        }
        return r + e;
    }

    function o() {
        return n();
    }

    return o();
}

function generate_buvid_fp(ua) {
    const e = function (e, t) {
            (e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]]), (t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]]);
            const r = [0, 0, 0, 0];
            return (
                (r[3] += e[3] + t[3]),
                (r[2] += r[3] >>> 16),
                (r[3] &= 65535),
                (r[2] += e[2] + t[2]),
                (r[1] += r[2] >>> 16),
                (r[2] &= 65535),
                (r[1] += e[1] + t[1]),
                (r[0] += r[1] >>> 16),
                (r[1] &= 65535),
                (r[0] += e[0] + t[0]),
                (r[0] &= 65535),
                [(r[0] << 16) | r[1], (r[2] << 16) | r[3]]
            );
        },
        t = function (e, t) {
            (e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]]), (t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]]);
            const r = [0, 0, 0, 0];
            return (
                (r[3] += e[3] * t[3]),
                (r[2] += r[3] >>> 16),
                (r[3] &= 65535),
                (r[2] += e[2] * t[3]),
                (r[1] += r[2] >>> 16),
                (r[2] &= 65535),
                (r[2] += e[3] * t[2]),
                (r[1] += r[2] >>> 16),
                (r[2] &= 65535),
                (r[1] += e[1] * t[3]),
                (r[0] += r[1] >>> 16),
                (r[1] &= 65535),
                (r[1] += e[2] * t[2]),
                (r[0] += r[1] >>> 16),
                (r[1] &= 65535),
                (r[1] += e[3] * t[1]),
                (r[0] += r[1] >>> 16),
                (r[1] &= 65535),
                (r[0] += e[0] * t[3] + e[1] * t[2] + e[2] * t[1] + e[3] * t[0]),
                (r[0] &= 65535),
                [(r[0] << 16) | r[1], (r[2] << 16) | r[3]]
            );
        },
        r = function (e, t) {
            return 32 === (t %= 64) ? [e[1], e[0]] : t < 32 ? [(e[0] << t) | (e[1] >>> (32 - t)), (e[1] << t) | (e[0] >>> (32 - t))] : ((t -= 32), [(e[1] << t) | (e[0] >>> (32 - t)), (e[0] << t) | (e[1] >>> (32 - t))]);
        },
        n = function (e, t) {
            return 0 === (t %= 64) ? e : t < 32 ? [(e[0] << t) | (e[1] >>> (32 - t)), e[1] << t] : [e[1] << (t - 32), 0];
        },
        o = function (e, t) {
            return [e[0] ^ t[0], e[1] ^ t[1]];
        },
        i = function (e) {
            return (e = o(e, [0, e[0] >>> 1])), (e = t(e, [4_283_543_511, 3_981_806_797])), (e = o(e, [0, e[0] >>> 1])), (e = t(e, [3_301_882_366, 444_984_403])), (e = o(e, [0, e[0] >>> 1]));
        },
        a = function (a, s = 0) {
            const u = (a = a || '').length % 16,
                h = [2_277_735_313, 289_559_509],
                v = [1_291_169_091, 658_871_167];
            let l = [0, s],
                f = [0, s],
                d = [0, 0],
                p = [0, 0],
                g = 0;
            for (let c = a.length - u; g < c; g += 16) {
                (d = [
                    (255 & a.charCodeAt(g + 4)) | ((255 & a.charCodeAt(g + 5)) << 8) | ((255 & a.charCodeAt(g + 6)) << 16) | ((255 & a.charCodeAt(g + 7)) << 24),
                    (255 & a.charCodeAt(g)) | ((255 & a.charCodeAt(g + 1)) << 8) | ((255 & a.charCodeAt(g + 2)) << 16) | ((255 & a.charCodeAt(g + 3)) << 24),
                ]),
                    (p = [
                        (255 & a.charCodeAt(g + 12)) | ((255 & a.charCodeAt(g + 13)) << 8) | ((255 & a.charCodeAt(g + 14)) << 16) | ((255 & a.charCodeAt(g + 15)) << 24),
                        (255 & a.charCodeAt(g + 8)) | ((255 & a.charCodeAt(g + 9)) << 8) | ((255 & a.charCodeAt(g + 10)) << 16) | ((255 & a.charCodeAt(g + 11)) << 24),
                    ]),
                    (d = t(d, h)),
                    (d = r(d, 31)),
                    (d = t(d, v)),
                    (l = o(l, d)),
                    (l = r(l, 27)),
                    (l = e(l, f)),
                    (l = e(t(l, [0, 5]), [0, 1_390_208_809])),
                    (p = t(p, v)),
                    (p = r(p, 33)),
                    (p = t(p, h)),
                    (f = o(f, p)),
                    (f = r(f, 31)),
                    (f = e(f, l)),
                    (f = e(t(f, [0, 5]), [0, 944_331_445]));
            }
            switch (((d = [0, 0]), (p = [0, 0]), u)) {
                case 15:
                    p = o(p, n([0, a.charCodeAt(g + 14)], 48));
                case 14:
                    p = o(p, n([0, a.charCodeAt(g + 13)], 40));
                case 13:
                    p = o(p, n([0, a.charCodeAt(g + 12)], 32));
                case 12:
                    p = o(p, n([0, a.charCodeAt(g + 11)], 24));
                case 11:
                    p = o(p, n([0, a.charCodeAt(g + 10)], 16));
                case 10:
                    p = o(p, n([0, a.charCodeAt(g + 9)], 8));
                case 9:
                    (p = o(p, [0, a.charCodeAt(g + 8)])), (p = t(p, v)), (p = r(p, 33)), (p = t(p, h)), (f = o(f, p));
                case 8:
                    d = o(d, n([0, a.charCodeAt(g + 7)], 56));
                case 7:
                    d = o(d, n([0, a.charCodeAt(g + 6)], 48));
                case 6:
                    d = o(d, n([0, a.charCodeAt(g + 5)], 40));
                case 5:
                    d = o(d, n([0, a.charCodeAt(g + 4)], 32));
                case 4:
                    d = o(d, n([0, a.charCodeAt(g + 3)], 24));
                case 3:
                    d = o(d, n([0, a.charCodeAt(g + 2)], 16));
                case 2:
                    d = o(d, n([0, a.charCodeAt(g + 1)], 8));
                case 1:
                    (d = o(d, [0, a.charCodeAt(g)])), (d = t(d, h)), (d = r(d, 31)), (d = t(d, v)), (l = o(l, d));
            }
            return (
                (l = o(l, [0, a.length])),
                (f = o(f, [0, a.length])),
                (l = e(l, f)),
                (f = e(f, l)),
                (l = i(l)),
                (f = i(f)),
                (l = e(l, f)),
                (f = e(f, l)),
                ('00000000' + (l[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (l[1] >>> 0).toString(16)).slice(-8) + ('00000000' + (f[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (f[1] >>> 0).toString(16)).slice(-8)
            );
        };

    const x64hash128 = a;

    function G_get(ua) {
        const r = {
            data: [],
            addPreprocessedComponent(t, n) {
                'function' === typeof e.preprocessor && (n = e.preprocessor(t, n)),
                    r.data.push({
                        key: t,
                        value: n,
                    });
            },
        };

        function randomString(length) {
            const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = length; i > 0; --i) {
                result += str[Math.floor(Math.random() * str.length)];
            }
            return result;
        }

        r.data = [
            {
                key: 'userAgent',
                value: ua + randomString(16),
            },
        ];
        return r.data;
    }

    function x(ua) {
        const t = G_get(ua);
        const n = t.map((e) => e.value).join('');
        return x64hash128(n, 31);
    }

    return x(ua);
}

async function get_bvuid4(ua, buvid3, b_nut, b_lsid, _uuid) {
    return (
        await got('https://api.bilibili.com/x/frontend/finger/spi', {
            headers: {
                'User-Agent': ua,
                Referer: 'https://www.bilibili.com/',
                Cookie: `buvid3=${buvid3}; b_nut=${b_nut}; b_lsid=${b_lsid}; _uuid=${_uuid}`,
            },
        }).json()
    ).data.b_4;
}

// async function get_bili_ticket_and_expires(ua, buvid3, b_nut, b_lsid, _uuid, buvid_fp, buvid4) {
//     function I(t) {
//         let e, n;
//         for (e = '', n = 0; n < t.length; n++) {
//             e += String.fromCharCode(t.charCodeAt(n) - 1);
//         }
//         return e;
//     }

//     function generateTicketParameter() {
//         const e = Math.floor(Date.now() / 1e3);
//         const n = 'YhxToH[2q';
//         const r = CryptoJS.HmacSHA256('ts'.concat(e), I(n));
//         const o = CryptoJS.enc.Hex.stringify(r);
//         return `key_id=ec02&hexsign=${o}&context[ts]=${e}&csrf=`;
//     }

//     async function get_bili_ticket(ua, buvid3, b_nut, b_lsid, _uuid, buvid_fp, buvid4) {
//         const parameter = generateTicketParameter();
//         await got(`https://space.bilibili.com/1`, {
//             headers: {
//                 'User-Agent': ua,
//                 Referer: 'https://www.bilibili.com/',
//                 Cookie: `buvid3=${buvid3}; b_nut=${b_nut}; b_lsid=${b_lsid}; _uuid=${_uuid}; buvid_fp=${buvid_fp}; buvid4=${buvid4}`,
//             },
//         });
//         const res = await got
//             .post(`https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket?${parameter}`, {
//                 headers: {
//                     'User-Agent': ua,
//                     Referer: 'https://space.bilibili.com/1',
//                     Cookie: `buvid3=${buvid3}; b_nut=${b_nut}; b_lsid=${b_lsid}; _uuid=${_uuid}; buvid_fp=${buvid_fp}; buvid4=${buvid4}`,
//                 },
//             })
//             .json();
//         return {
//             bili_ticket: res.data.ticket,
//             bili_ticket_expires: res.data.created_at + res.data.ttl,
//         };
//     }

//     return await get_bili_ticket(ua, buvid3, b_nut, b_lsid, _uuid, buvid_fp, buvid4);
// }

async function getBilibiliCookie(ua) {
    const cookie = {};
    const buvid3_and_b_nut = await get_buvid3_and_b_nut(ua);
    cookie.buvid3 = buvid3_and_b_nut.buvid3;
    cookie.b_nut = buvid3_and_b_nut.b_nut;
    cookie.b_lsid = generate_b_lsid();
    cookie._uuid = generate_uuid();
    cookie.buvid_fp = generate_buvid_fp(ua);
    cookie.buvid4 = await get_bvuid4(ua, cookie.buvid3, cookie.b_nut, cookie.b_lsid, cookie._uuid);
    // const bili_ticket_and_expires = await get_bili_ticket_and_expires(ua, cookie.buvid3, cookie.b_nut, cookie.b_lsid, cookie._uuid, cookie.buvid_fp, cookie.buvid4);
    // cookie.bili_ticket = bili_ticket_and_expires.bili_ticket;
    // cookie.bili_ticket_expires = bili_ticket_and_expires.bili_ticket_expires;
    return cookie;
}

async function getWbiImg(ua, buvid3, b_nut, b_lsid, _uuid, buvid_fp, buvid4) {
    const res = await got('https://space.bilibili.com/1', {
        headers: {
            'User-Agent': ua,
            Referer: 'https://www.bilibili.com/',
            Cookie: `buvid3=${buvid3}; b_nut=${b_nut}; b_lsid=${b_lsid}; _uuid=${_uuid}; buvid_fp=${buvid_fp}; buvid4=${buvid4}`,
        },
    });
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(res.body, 'text/html');
    // eslint-disable-next-line unicorn/prefer-query-selector
    const access_id = JSON.parse(decodeURIComponent(doc.getElementById('__RENDER_DATA__').firstChild.nodeValue)).access_id;
    const res2 = await got('https://api.bilibili.com/x/web-interface/nav', {
        headers: {
            'User-Agent': ua,
            Referer: 'https://space.bilibili.com/1',
            Cookie: `buvid3=${buvid3}; b_nut=${b_nut}; b_lsid=${b_lsid}; _uuid=${_uuid}; buvid_fp=${buvid_fp}; buvid4=${buvid4}`,
        },
    }).json();
    const wbi_img = res2.data.wbi_img;
    wbi_img.access_id = access_id;
    return wbi_img;
}

function generateWbiInfoQueryStr(sort, queryStr, wbi_img) {
    function L(e) {
        return e.substring(e.lastIndexOf('/') + 1, e.length).split('.')[0];
    }

    const x = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const S = {
        rotl(t, e) {
            return (t << e) | (t >>> (32 - e));
        },
        rotr(t, e) {
            return (t << (32 - e)) | (t >>> e);
        },
        endian(t) {
            if (t.constructor === Number) {
                return (16_711_935 & S.rotl(t, 8)) | (4_278_255_360 & S.rotl(t, 24));
            }
            for (let e = 0; e < t.length; e++) {
                t[e] = S.endian(t[e]);
            }
            return t;
        },
        randomBytes(t) {
            const e = [];
            for (; t > 0; t--) {
                e.push(Math.floor(256 * Math.random()));
            }
            return e;
        },
        bytesToWords(t) {
            const e = [];
            for (let n = 0, r = 0; n < t.length; n++, r += 8) {
                e[r >>> 5] |= t[n] << (24 - (r % 32));
            }
            return e;
        },
        wordsToBytes(t) {
            const e = [];
            for (let n = 0; n < 32 * t.length; n += 8) {
                e.push((t[n >>> 5] >>> (24 - (n % 32))) & 255);
            }
            return e;
        },
        bytesToHex(t) {
            const e = [];
            for (const element of t) {
                e.push((element >>> 4).toString(16)), e.push((15 & element).toString(16));
            }
            return e.join('');
        },
        hexToBytes(t) {
            const e = [];
            for (let n = 0; n < t.length; n += 2) {
                e.push(Number.parseInt(t.substr(n, 2), 16));
            }
            return e;
        },
        bytesToBase64(t) {
            const e = [];
            for (let n = 0; n < t.length; n += 3) {
                for (let r = (t[n] << 16) | (t[n + 1] << 8) | t[n + 2], o = 0; o < 4; o++) {
                    8 * n + 6 * o <= 8 * t.length ? e.push(x.charAt((r >>> (6 * (3 - o))) & 63)) : e.push('=');
                }
            }
            return e.join('');
        },
        base64ToBytes(t) {
            // eslint-disable-next-line no-useless-escape
            t = t.replaceAll(/[^\d+/a-z]/gi, '');
            const e = [];
            for (let n = 0, r = 0; n < t.length; r = ++n % 4) {
                0 !== r && e.push(((x.indexOf(t.charAt(n - 1)) & (Math.pow(2, -2 * r + 8) - 1)) << (2 * r)) | (x.indexOf(t.charAt(n)) >>> (6 - 2 * r)));
            }
            return e;
        },
    };

    const j = {
        utf8: {
            stringToBytes(t) {
                return j.bin.stringToBytes(unescape(encodeURIComponent(t)));
            },
            bytesToString(t) {
                return decodeURIComponent(escape(j.bin.bytesToString(t)));
            },
        },
        bin: {
            stringToBytes(t) {
                const e = [];
                for (let n = 0; n < t.length; n++) {
                    e.push(255 & t.charCodeAt(n));
                }
                return e;
            },
            bytesToString(t) {
                const e = [];
                for (const element of t) {
                    e.push(String.fromCharCode(element));
                }
                return e.join('');
            },
        },
    };

    const _ = function (t) {
        return (
            null !== t &&
            (T(t) ||
                (function (t) {
                    return 'function' === typeof t.readFloatLE && 'function' === typeof t.slice && T(t.slice(0, 0));
                })(t) ||
                !!t._isBuffer)
        );
    };

    function T(t) {
        return !!t.constructor && 'function' === typeof t.constructor.isBuffer && t.constructor.isBuffer(t);
    }

    const t = S,
        e = j.utf8,
        n = _,
        r = j.bin,
        o = function o(i, a) {
            i.constructor === String
                ? (i = a && 'binary' === a.encoding ? r.stringToBytes(i) : e.stringToBytes(i))
                : n(i)
                  ? (i = Array.prototype.slice.call(i, 0))
                  : Array.isArray(i) || i.constructor === Uint8Array || (i = i.toString());
            const c = t.bytesToWords(i),
                u = 8 * i.length;
            let s = 1_732_584_193,
                l = -271_733_879,
                f = -1_732_584_194,
                p = 271_733_878;
            let d = 0;
            for (; d < c.length; d++) {
                c[d] = (16_711_935 & ((c[d] << 8) | (c[d] >>> 24))) | (4_278_255_360 & ((c[d] << 24) | (c[d] >>> 8)));
            }
            (c[u >>> 5] |= 128 << u % 32), (c[14 + (((u + 64) >>> 9) << 4)] = u);
            const h = o._ff,
                v = o._gg,
                y = o._hh,
                m = o._ii;
            for (d = 0; d < c.length; d += 16) {
                const g = s,
                    b = l,
                    w = f,
                    A = p;
                (s = h(s, l, f, p, c[d + 0], 7, -680_876_936)),
                    (p = h(p, s, l, f, c[d + 1], 12, -389_564_586)),
                    (f = h(f, p, s, l, c[d + 2], 17, 606_105_819)),
                    (l = h(l, f, p, s, c[d + 3], 22, -1_044_525_330)),
                    (s = h(s, l, f, p, c[d + 4], 7, -176_418_897)),
                    (p = h(p, s, l, f, c[d + 5], 12, 1_200_080_426)),
                    (f = h(f, p, s, l, c[d + 6], 17, -1_473_231_341)),
                    (l = h(l, f, p, s, c[d + 7], 22, -45_705_983)),
                    (s = h(s, l, f, p, c[d + 8], 7, 1_770_035_416)),
                    (p = h(p, s, l, f, c[d + 9], 12, -1_958_414_417)),
                    (f = h(f, p, s, l, c[d + 10], 17, -42063)),
                    (l = h(l, f, p, s, c[d + 11], 22, -1_990_404_162)),
                    (s = h(s, l, f, p, c[d + 12], 7, 1_804_603_682)),
                    (p = h(p, s, l, f, c[d + 13], 12, -40_341_101)),
                    (f = h(f, p, s, l, c[d + 14], 17, -1_502_002_290)),
                    (s = v(s, (l = h(l, f, p, s, c[d + 15], 22, 1_236_535_329)), f, p, c[d + 1], 5, -165_796_510)),
                    (p = v(p, s, l, f, c[d + 6], 9, -1_069_501_632)),
                    (f = v(f, p, s, l, c[d + 11], 14, 643_717_713)),
                    (l = v(l, f, p, s, c[d + 0], 20, -373_897_302)),
                    (s = v(s, l, f, p, c[d + 5], 5, -701_558_691)),
                    (p = v(p, s, l, f, c[d + 10], 9, 38_016_083)),
                    (f = v(f, p, s, l, c[d + 15], 14, -660_478_335)),
                    (l = v(l, f, p, s, c[d + 4], 20, -405_537_848)),
                    (s = v(s, l, f, p, c[d + 9], 5, 568_446_438)),
                    (p = v(p, s, l, f, c[d + 14], 9, -1_019_803_690)),
                    (f = v(f, p, s, l, c[d + 3], 14, -187_363_961)),
                    (l = v(l, f, p, s, c[d + 8], 20, 1_163_531_501)),
                    (s = v(s, l, f, p, c[d + 13], 5, -1_444_681_467)),
                    (p = v(p, s, l, f, c[d + 2], 9, -51_403_784)),
                    (f = v(f, p, s, l, c[d + 7], 14, 1_735_328_473)),
                    (s = y(s, (l = v(l, f, p, s, c[d + 12], 20, -1_926_607_734)), f, p, c[d + 5], 4, -378558)),
                    (p = y(p, s, l, f, c[d + 8], 11, -2_022_574_463)),
                    (f = y(f, p, s, l, c[d + 11], 16, 1_839_030_562)),
                    (l = y(l, f, p, s, c[d + 14], 23, -35_309_556)),
                    (s = y(s, l, f, p, c[d + 1], 4, -1_530_992_060)),
                    (p = y(p, s, l, f, c[d + 4], 11, 1_272_893_353)),
                    (f = y(f, p, s, l, c[d + 7], 16, -155_497_632)),
                    (l = y(l, f, p, s, c[d + 10], 23, -1_094_730_640)),
                    (s = y(s, l, f, p, c[d + 13], 4, 681_279_174)),
                    (p = y(p, s, l, f, c[d + 0], 11, -358_537_222)),
                    (f = y(f, p, s, l, c[d + 3], 16, -722_521_979)),
                    (l = y(l, f, p, s, c[d + 6], 23, 76_029_189)),
                    (s = y(s, l, f, p, c[d + 9], 4, -640_364_487)),
                    (p = y(p, s, l, f, c[d + 12], 11, -421_815_835)),
                    (f = y(f, p, s, l, c[d + 15], 16, 530_742_520)),
                    (s = m(s, (l = y(l, f, p, s, c[d + 2], 23, -995_338_651)), f, p, c[d + 0], 6, -198_630_844)),
                    (p = m(p, s, l, f, c[d + 7], 10, 1_126_891_415)),
                    (f = m(f, p, s, l, c[d + 14], 15, -1_416_354_905)),
                    (l = m(l, f, p, s, c[d + 5], 21, -57_434_055)),
                    (s = m(s, l, f, p, c[d + 12], 6, 1_700_485_571)),
                    (p = m(p, s, l, f, c[d + 3], 10, -1_894_986_606)),
                    (f = m(f, p, s, l, c[d + 10], 15, -1_051_523)),
                    (l = m(l, f, p, s, c[d + 1], 21, -2_054_922_799)),
                    (s = m(s, l, f, p, c[d + 8], 6, 1_873_313_359)),
                    (p = m(p, s, l, f, c[d + 15], 10, -30_611_744)),
                    (f = m(f, p, s, l, c[d + 6], 15, -1_560_198_380)),
                    (l = m(l, f, p, s, c[d + 13], 21, 1_309_151_649)),
                    (s = m(s, l, f, p, c[d + 4], 6, -145_523_070)),
                    (p = m(p, s, l, f, c[d + 11], 10, -1_120_210_379)),
                    (f = m(f, p, s, l, c[d + 2], 15, 718_787_259)),
                    (l = m(l, f, p, s, c[d + 9], 21, -343_485_551)),
                    (s = (s + g) >>> 0),
                    (l = (l + b) >>> 0),
                    (f = (f + w) >>> 0),
                    (p = (p + A) >>> 0);
            }
            return t.endian([s, l, f, p]);
        };
    (o._ff = function (t, e, n, r, o, i, a) {
        const c = t + ((e & n) | (~e & r)) + (o >>> 0) + a;
        return ((c << i) | (c >>> (32 - i))) + e;
    }),
        (o._gg = function (t, e, n, r, o, i, a) {
            const c = t + ((e & r) | (n & ~r)) + (o >>> 0) + a;
            return ((c << i) | (c >>> (32 - i))) + e;
        }),
        (o._hh = function (t, e, n, r, o, i, a) {
            const c = t + (e ^ n ^ r) + (o >>> 0) + a;
            return ((c << i) | (c >>> (32 - i))) + e;
        }),
        (o._ii = function (t, e, n, r, o, i, a) {
            const c = t + (n ^ (e | ~r)) + (o >>> 0) + a;
            return ((c << i) | (c >>> (32 - i))) + e;
        }),
        (o._blocksize = 16),
        (o._digestsize = 16);

    const R = function (e, n) {
        if (null === e) {
            throw new Error('Illegal argument ' + e);
        }
        const i = t.wordsToBytes(o(e, n));
        return n && n.asBytes ? i : n && n.asString ? r.bytesToString(i) : t.bytesToHex(i);
    };

    function I(t, wbi_img) {
        let n, r;
        const o = (function (wbi_img) {
                let e;
                const n =
                        (null ===
                            (e = (function () {
                                return [wbi_img.img_url, wbi_img.sub_url].join('-');
                            })()) || void 0 === e
                            ? void 0
                            : e.split('-')) || [],
                    r = n[0],
                    o = n[1],
                    i = L(r),
                    a = L(o);
                return {
                    imgKey: i,
                    subKey: a,
                };
            })(wbi_img),
            i = o.imgKey,
            a = o.subKey;
        if (i && a) {
            const c =
                    ((n = i + a),
                    (r = []),
                    [
                        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6,
                        63, 57, 62, 11, 36, 20, 34, 44, 52,
                        // eslint-disable-next-line unicorn/no-array-for-each
                    ].forEach((t) => {
                        n.charAt(t) && r.push(n.charAt(t));
                    }),
                    r.join('').slice(0, 32)),
                u = Math.round(Date.now() / 1e3),
                f = [];
            for (
                let u = Math.round(Date.now() / 1e3),
                    s = Object.assign({}, t, {
                        wts: u,
                    }),
                    l = Object.keys(s).sort(),
                    p = /[!'()*]/g,
                    d = 0;
                d < l.length;
                d++
            ) {
                const h = l[d];
                let v = s[h];
                v && 'string' === typeof v && (v = v.replaceAll(p, '')), null !== v && f.push(''.concat(encodeURIComponent(h), '=').concat(encodeURIComponent(v)));
            }
            const y = f.join('&');
            return {
                w_rid: R(y + c),
                wts: u.toString(),
            };
        }
        return null;
    }

    function generateWbi(queryStr, wbi_img) {
        const parameter = {};
        for (const kvStr of `${queryStr}&w_webid=${wbi_img.access_id}`.split('&')) {
            const kv = kvStr.split('=');
            parameter[kv[0]] = decodeURIComponent(kv[1]);
        }
        return Object.assign(I(parameter, wbi_img), { w_webid: wbi_img.access_id });
    }

    function generateWbiInfo(sort, queryStr, wbi_img) {
        const wbi = generateWbi(queryStr, wbi_img);
        const kv = sort.map((key) => `${key}=${encodeURIComponent(wbi[key])}`);
        return kv.join('&');
    }

    return generateWbiInfo(sort, queryStr, wbi_img);
}

function generateDmInfoQueryStr(sort, webglStr, webglVendorAndRenderer, logStack) {
    function _0x4bd36b(_0x5d1e8d) {
        const _0xfb1bfa = new TextEncoder().encode(_0x5d1e8d).buffer,
            _0x87c77a = new Uint8Array(_0xfb1bfa),
            _0x50a9f3 = btoa(String.fromCharCode.apply(null, _0x87c77a));
        return _0x50a9f3.substring(0x0, _0x50a9f3.length - 0x2);
    }

    const _0x551927 = (function (_0x176f28) {
        return (_0x176f28.Move = 'mousemove'), (_0x176f28.Click = 'click'), (_0x176f28.Keydown = 'keydown'), (_0x176f28.Wheel = 'wheel'), (_0x176f28.Touch = 'touch'), (_0x176f28.Focus = 'focus'), _0x176f28;
    })({});

    const _0x3988f6 = {};
    for (const [_0x3df9f3, _0x416100] of Object.keys(_0x551927).entries()) {
        _0x3988f6[_0x551927[_0x416100]] = _0x3df9f3;
    }

    function _0x1a08dc(_0x1b9d5a) {
        return Math.floor(0x72 * Math.random() * _0x1b9d5a);
    }

    function _0x43dd3a(_0x1462b9, _0x51c2fe, _0x2b8849, _0x3f3cf7, _0x2da5d7, _0x413053) {
        let _0x39d1c4, _0x80adec;
        const _0xa46fe8 = _0x1a08dc(_0x2da5d7);
        return (
            void 0x0 !== _0x1462b9 && void 0x0 !== _0x51c2fe
                ? ((_0x39d1c4 = 3 * _0x1462b9 + 2 * _0x51c2fe + _0xa46fe8), (_0x80adec = 4 * _0x1462b9 - 5 * _0x51c2fe + _0xa46fe8))
                : ((_0x39d1c4 = 3 * _0xa46fe8 + 2 * _0xa46fe8 + _0xa46fe8), (_0x80adec = 4 * _0xa46fe8 - 5 * _0xa46fe8)),
            [_0x39d1c4, _0x80adec, _0xa46fe8, _0x2b8849, _0x413053 ? _0x413053.charCodeAt(0x0) : Math.floor(0x43 * Math.random()) + 0x3c, _0x3988f6[_0x3f3cf7]]
        );
    }

    function _0x2e17e8(_0x365f6e) {
        if (Array.isArray(_0x365f6e)) {
            return _0x365f6e;
        }
    }

    // eslint-disable-next-line no-unused-vars
    const _0x613a5f = function (_0x4b3628, _0x6ee937) {
            return _0x2e17e8(_0x4b3628);
        },
        _0x16d5d6 = function () {
            return _0x613a5f;
        },
        _0x5ec12e = ['g', 'w', 'A', 'Q'],
        _0x30ddcd = String.fromCharCode(0x4d),
        _0x5d32aa = String.fromCharCode(0x4e),
        _0x5773c2 = btoa((0x9b).toString()).substring(0x6),
        _0x4a678a = Number(atob(_0x30ddcd + _0x5ec12e[0x0] + _0x5773c2)),
        _0x3bc098 = Number(atob(_0x30ddcd + _0x5ec12e[0x1] + _0x5773c2)),
        _0x1e4c6f = Number(atob(_0x5d32aa + _0x5ec12e[0x2] + _0x5773c2));

    function _0xb3fd69(_0x361c67) {
        const _0x556632 = _0x16d5d6()(_0x361c67, 0x2),
            _0x3dc4b6 = _0x556632[0x0],
            _0x2bea5e = _0x556632[0x1],
            _0x1b447a = Math.floor(0x72 * Math.random());
        return [_0x4a678a * _0x3dc4b6 + _0x4a678a * _0x2bea5e + _0x3bc098 * _0x1b447a, _0x1e4c6f * _0x3dc4b6 - _0x2bea5e + _0x1b447a, _0x1b447a];
    }

    function _0x445907(_0x61fce4) {
        const _0x2fb26a = _0x16d5d6()(_0x61fce4, 0x2),
            _0x18bce7 = _0x2fb26a[0x0],
            _0x24ce6a = _0x2fb26a[0x1],
            _0x4fcb44 = Math.floor(0x202 * Math.random());
        return [_0x3bc098 * _0x18bce7 + _0x4a678a * _0x24ce6a + _0x4fcb44, _0x1e4c6f * _0x18bce7 - _0x1e4c6f * _0x24ce6a + _0x4a678a * _0x4fcb44, _0x4fcb44];
    }

    const winWidth = 906;
    const winHeight = 945;
    const scrollTop = 0;
    const scrollLeft = 0;

    function _0x416f02(_0x572074) {
        const _0x3a4ad8 = _0x572074.getBoundingClientRect();
        return [Math.trunc(_0x3a4ad8.top), Math.trunc(_0x3a4ad8.left), Math.trunc(_0x3a4ad8.width), Math.trunc(_0x3a4ad8.height)];
    }

    const _0x3ebba9 = {
        span: 0x1,
        div: 0x2,
        p: 0x3,
        a: 0x4,
        img: 0x5,
        input: 0x6,
        button: 0x7,
        ul: 0x8,
        ol: 0x9,
        li: 0xa,
        h1: 0xb,
        h2: 0xc,
        h3: 0xd,
        h4: 0xe,
        h5: 0xf,
        h6: 0x10,
        form: 0x11,
        textarea: 0x12,
        select: 0x13,
        option: 0x14,
        table: 0x15,
        tr: 0x16,
        td: 0x17,
        th: 0x18,
        label: 0x19,
        strong: 0x1a,
        em: 0x1b,
        section: 0x1c,
        article: 0x1d,
    };

    function _0xed08b(_0x4b0395) {
        const _0x34de41 = _0x4b0395.tagName.toLowerCase();
        return _0x3ebba9[_0x34de41] || 0x0;
    }

    function _0x29fc56(_0x40ff97) {
        return _0x4bd36b(_0x40ff97.className || '');
    }

    // eslint-disable-next-line no-unused-vars
    function getElInfo(_0x1f3a0a, _0x5dd8a4) {
        const _0x7d11f7 = [];
        const _0x3263ae = _0x1f3a0a.at(-0x1);
        _0x3263ae && _0x3263ae.target && _0x7d11f7.push(_0x3263ae.target);
        return _0x7d11f7
            ? _0x7d11f7.map((_0x4a1c6c) => {
                  const _0xa856db = _0x4a1c6c,
                      _0x2015a3 = _0x416f02(_0xa856db),
                      _0x8039f3 = _0x16d5d6()(_0x2015a3, 0x4),
                      _0x1f5014 = _0x8039f3[0x0],
                      _0x4d8ce2 = _0x8039f3[0x1],
                      _0x49a3ee = _0x8039f3[0x2],
                      _0x33ccfa = _0x8039f3[0x3],
                      _0x45bde5 = _0xb3fd69([_0x1f5014, _0x4d8ce2]),
                      _0x421a0c = _0x16d5d6()(_0x45bde5, 0x3),
                      _0x121960 = _0x421a0c[0x0],
                      _0x416e77 = _0x421a0c[0x1],
                      _0x80dda9 = _0x421a0c[0x2],
                      _0x12b649 = _0x445907([_0x49a3ee, _0x33ccfa]),
                      _0x21b533 = _0x16d5d6()(_0x12b649, 0x3),
                      _0x2a503f = _0x21b533[0x0],
                      _0x243c67 = _0x21b533[0x1],
                      _0x2e280a = _0x21b533[0x2];
                  return {
                      t: _0xed08b(_0xa856db),
                      c: _0x29fc56(_0xa856db),
                      p: [_0x121960, _0x80dda9, _0x416e77],
                      s: [_0x2e280a, _0x2a503f, _0x243c67],
                  };
              })
            : [];
    }

    function getActiveFeaturesStr(_0x211a54, logStack) {
        const _0x2cac63 = {
            ds: getElInfo(logStack, _0x211a54),
            wh: _0xb3fd69([Math.trunc(winWidth), Math.trunc(winHeight)]),
            of: _0x445907([Math.trunc(scrollTop), Math.trunc(scrollLeft)]),
        };
        try {
            return JSON.stringify(_0x2cac63);
            // eslint-disable-next-line no-unused-vars
        } catch {
            return '';
        }
    }

    // const typeList = ["click", "mousemove", "keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "touchmove", "focus"];

    function queryUserLog(webglStr, webglVendorAndRenderer, logStack) {
        const _0x44d7cc = (function (_0x165939) {
            const _0x4cd45a = _0x165939.map((_0x4dabe4, _0x50bd81) => {
                    const _0x3661e6 = _0x4dabe4.x,
                        _0x19553d = void 0x0 === _0x3661e6 ? 0x0 : _0x3661e6,
                        _0x34e6f1 = _0x4dabe4.y,
                        _0xd8f6e5 = void 0x0 === _0x34e6f1 ? 0x0 : _0x34e6f1,
                        _0x5856e2 = _0x4dabe4.timestamp,
                        _0x5b5403 = _0x4dabe4.type,
                        _0x12882f = _0x4dabe4.key;
                    return _0x43dd3a(_0x19553d, _0xd8f6e5, _0x5856e2, _0x5b5403, _0x50bd81, _0x12882f);
                }),
                _0x93ccc2 = _0x4cd45a.map((_0x18775c) => ({
                    x: _0x18775c[0x0],
                    y: _0x18775c[0x1],
                    z: _0x18775c[0x2],
                    timestamp: _0x18775c[0x3],
                    k: _0x18775c[0x4],
                    type: _0x18775c[0x5],
                }));
            try {
                return JSON.stringify(_0x93ccc2);
            } catch (error) {
                // return console.log(error),
                return error;
            }
        })(logStack);
        return [_0x44d7cc, _0x4bd36b(webglStr), _0x4bd36b(webglVendorAndRenderer), getActiveFeaturesStr(undefined, logStack)];
    }

    function h(t, e) {
        return (
            (function (t) {
                if (Array.isArray(t)) {
                    return t;
                }
            })(t) ||
            (function (t, e) {
                let n = null === t ? null : ('undefined' !== typeof Symbol && t[Symbol.iterator]) || t['@@iterator'];
                if (null !== n) {
                    const c = [];
                    let r,
                        o,
                        i,
                        a,
                        u = !0,
                        s = !1;
                    try {
                        if (((i = (n = n.call(t)).next), 0 === e)) {
                            if (Object(n) !== n) {
                                return;
                            }
                            u = !1;
                        } else {
                            for (; !(u = (r = i.call(n)).done) && (c.push(r.value), c.length !== e); u = !0) {
                                /* empty */
                            }
                        }
                    } catch (error) {
                        (s = !0), (o = error);
                    } finally {
                        try {
                            if (!u && null !== n.return && ((a = n.return()), Object(a) !== a)) {
                                // eslint-disable-next-line no-unsafe-finally
                                return;
                            }
                        } finally {
                            if (s) {
                                // eslint-disable-next-line no-unsafe-finally
                                throw o;
                            }
                        }
                    }
                    return c;
                }
            })(t, e) ||
            (function (t, e) {
                if (!t) {
                    return;
                }
                if ('string' === typeof t) {
                    return v(t, e);
                }
                let n = Object.prototype.toString.call(t).slice(8, -1);
                'Object' === n && t.constructor && (n = t.constructor.name);
                if ('Map' === n || 'Set' === n) {
                    return [...t];
                }
                if ('Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) {
                    return v(t, e);
                }
            })(t, e) ||
            (function () {
                throw new TypeError('Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
            })()
        );
    }

    function v(t, e) {
        (null === e || e > t.length) && (e = t.length);
        const r = Array.from({ length: e });
        for (let n = 0; n < e; n++) {
            r[n] = t[n];
        }
        return r;
    }

    function generateDm(webglStr, webglVendorAndRenderer, logStack) {
        const u = queryUserLog(webglStr, webglVendorAndRenderer, logStack);
        const l = h(u, 4);
        return {
            dm_img_list: l[0],
            dm_img_str: l[1],
            dm_cover_img_str: l[2],
            dm_img_inter: l[3],
        };
    }

    function generateDmInfo(sort, webglStr, webglVendorAndRenderer, logStack) {
        const dm = generateDm(webglStr, webglVendorAndRenderer, logStack);
        const kv = sort.map((key) => `${key}=${encodeURIComponent(dm[key])}`);
        return kv.join('&');
    }

    return generateDmInfo(sort, webglStr, webglVendorAndRenderer, logStack);
}

// https://github.com/errcw/gaussian/blob/master/lib/box-muller.js
function generateGaussianInteger(mean, std) {
    const _2PI = Math.PI * 2;
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(_2PI * u2);

    return Math.round(z0 * std + mean);
}

function generateLogStack() {
    const logStack = [];
    const size = Math.floor(Math.random() * 0) + 1;
    let timestamp = 0;
    for (let i = 0; i < size; i++) {
        timestamp += Math.max(generateGaussianInteger(30, 5), 0);
        logStack.push({
            type: 'mousemove',
            x: Math.min(Math.max(generateGaussianInteger(500, 5), 0), 889),
            y: Math.min(Math.max(generateGaussianInteger(500, 5), 0), 928),
            preX: 0,
            preY: 0,
            changeDistance: 0,
            timestamp,
            target: {
                getBoundingClientRect: function getBoundingClientRect() {
                    return {
                        x: 0,
                        y: 0,
                        width: 889,
                        height: 928,
                        top: 0,
                        right: 889,
                        bottom: 928,
                        left: 0,
                    };
                },
                tagName: 'BODY',
                className: '',
            },
        });
    }
    return logStack;
}

module.exports = {
    iframe,
    asyncSleep,
    getBilibiliCookie,
    getWbiImg,
    generateWbiInfoQueryStr,
    generateDmInfoQueryStr,
    generateLogStack,
    bvidTime: 1_589_990_400,
};
