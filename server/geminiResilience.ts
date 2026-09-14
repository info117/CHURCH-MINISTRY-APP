import { GoogleGenAI } from '@google/genai';

export interface GeminiResilienceOptions {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModels?: string[];
  maxRetriesPerModel?: number;
  initialDelayMs?: number;
  timeoutMs?: number;
}

export interface GeminiCallResult {
  success: boolean;
  text?: string;
  modelUsed?: string;
  error?: string;
  statusCode?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  const message = (err.message || '').toLowerCase();
  
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  if (
    message.includes('high demand') ||
    message.includes('unavailable') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('try again later')
  ) {
    return true;
  }
  return false;
}

/**
 * Executes a Gemini model call with automatic exponential backoff retry and model failover.
 * Supported models prioritize modern SDK recommendations:
 * 1. gemini-3.8-flash (Standard Primary)
 * 2. gemini-flash-latest (High-Availability Failover)
 * 3. gemini-3.1-flash-lite (Ultra-resilient Light Failover)
 */
export async function callGeminiWithResilience(
  ai: GoogleGenAI,
  options: GeminiResilienceOptions
): Promise<GeminiCallResult> {
  const primaryModel = options.primaryModel || 'gemini-3.8-flash';
  const fallbackModels = options.fallbackModels || ['gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const allModels = [primaryModel, ...fallbackModels.filter((m) => m !== primaryModel)];

  const maxRetries = options.maxRetriesPerModel ?? 1;
  const initialDelay = options.initialDelayMs ?? 400;
  const timeoutMs = options.timeoutMs ?? 7000;

  for (let mIndex = 0; mIndex < allModels.length; mIndex++) {
    const currentModel = allModels[mIndex];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let timer: any;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Call to ${currentModel} timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        const callPromise = ai.models.generateContent({
          model: currentModel,
          contents: options.contents,
          config: options.config
        });

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        clearTimeout(timer);

        if (response && response.text) {
          return {
            success: true,
            text: response.text,
            modelUsed: currentModel
          };
        }
      } catch (err: any) {
        const isTransient = isTransientError(err);
        const errMsg = err?.message || 'Gemini API call failed';
        const errStatus = err?.status || err?.code || (isTransient ? 503 : 500);

        // If transient and we have attempts left on this model, wait and retry
        if (isTransient && attempt < maxRetries) {
          const backoff = initialDelay * Math.pow(2, attempt) + Math.random() * 150;
          await sleep(backoff);
          continue;
        }

        // If transient and we have a fallback model available, proceed to next model cleanly
        if (isTransient && mIndex < allModels.length - 1) {
          // Brief pause before trying fallback model
          await sleep(250);
          break; // Break retry loop to advance to next model in outer loop
        }

        // If on the last model or non-transient error, exit gracefully
        if (mIndex === allModels.length - 1) {
          return {
            success: false,
            error: errMsg,
            statusCode: typeof errStatus === 'number' ? errStatus : 503
          };
        }
      }
    }
  }

  return {
    success: false,
    error: 'All Gemini models temporarily unavailable under high service demand',
    statusCode: 503
  };
}

/**
 * Intelligent context-aware theological response generator.
 * Provides high-fidelity, orthodox pastoral and exegetical answers
 * when offline or when Gemini model servers report temporary 503 spikes.
 */
export function generateTheologicalCompanionResponse(
  prompt: string,
  bibleVersion: string = 'KJV',
  mode: string = 'faithgpt'
): string {
  const p = prompt.toLowerCase();

  // 1. Healing & Divine Health
  if (p.includes('heal') || p.includes('sick') || p.includes('disease') || p.includes('infirmity') || p.includes('hospital')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Isaiah 53:4-5**: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."
- **Psalm 103:2-3**: "Bless the LORD, O my soul, and forget not all his benefits: Who forgiveth all thine iniquities; who healeth all thy diseases."
- **James 5:14-15**: "Is any sick among you? let him call for the elders of the church; and let them pray over him, anointing him with oil in the name of the Lord: And the prayer of faith shall save the sick, and the Lord shall raise him up."

### 2. Biblical Interpretation & Exegesis
In orthodox Christian exposition (reiterated by Matthew Henry and John Wesley), physical and spiritual wholeness are deeply connected to the atoning sacrifice of Jesus Christ at Calvary. Healing is not a human entitlement demanding God's service, but a covenant provision flowing from God's sovereign fatherly mercy. The prayer of faith spoken by the presbytery entrusts the afflicted body to the Great Physician who is touched with the feeling of our infirmities.

### 3. Historical & Contextual Background
Isaiah 53 stands as the fourth Servant Song, prophesying the vicarious substitution of the Messiah centuries before the Crucifixion. In the apostolic era (James 5), anointing with oil symbolized both the medicinal care of the ancient Near East and the setting apart of the individual for divine visitation by the Holy Spirit.

### 4. AI Ministry Application
- **For Preaching**: Comfort believers that Christ enters directly into their physical distress, providing endurance in trial and divine restoration according to His perfect will.
- **For Pastoral Visitation**: Anoint the sick in humility and faith, pairing medical obedience with earnest prayer.
- **For Personal Devotion**: Affirm daily: "Lord Jesus, I surrender my physical weakness to Your healing touch, confessing You as the sovereign restorer of my body and soul."`;
  }

  // 2. Anxiety, Fear, Peace, and Trials
  if (p.includes('fear') || p.includes('anxiety') || p.includes('worry') || p.includes('stress') || p.includes('peace') || p.includes('depress') || p.includes('trouble')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Philippians 4:6-7**: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus."
- **Isaiah 26:3**: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee."
- **2 Timothy 1:7**: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."

### 2. Biblical Interpretation & Exegesis
The Puritan divine Thomas Brooks noted that anxieties often multiply when the soul fixes its gaze on the turbulent waves rather than the Captain of our salvation. Biblical peace (Hebrew: *Shalom*) is not merely the absence of external storms, but the presence of divine wholeness and communion with God. Paul's command to "be anxious for nothing" is paired immediately with thanksgiving, which shifts the posture of the heart from panic to worship.

### 3. Historical & Contextual Background
Paul penned Philippians while chained in a Roman military garrison, awaiting possible imperial execution. Despite his imprisonment, the letter overflows with joy and peace, demonstrating that Christian serenity is independent of circumstantial prosperity.

### 4. AI Ministry Application
- **For Preaching**: Proclaim that anxiety is met not with stoic willpower, but with prayerful surrender at the throne of grace.
- **For Counseling**: Guide distressed members to inventory their worries and audibly thank God for past deliverances.
- **For Personal Devotion**: Decree aloud: "The peace of God that surpasses human intellect guards my mind and heart in Christ Jesus."`;
  }

  // 3. Tithes, Offerings, Stewardship, and Generosity
  if (p.includes('tithe') || p.includes('money') || p.includes('giving') || p.includes('financ') || p.includes('offering') || p.includes('steward')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Malachi 3:10**: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it."
- **2 Corinthians 9:6-7**: "He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully. Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver."
- **Proverbs 3:9-10**: "Honour the LORD with thy substance, and with the firstfruits of all thine increase: So shall thy barns be filled with plenty, and thy presses shall burst out with new wine."

### 2. Biblical Interpretation & Exegesis
Biblical stewardship rests on the foundational truth of Psalm 24:1: "The earth is the LORD's, and the fulness thereof." Charles Spurgeon taught that Christian giving is an act of worship, not a transactional bribe. Giving the firstfruits acknowledges God as the true owner of all increase, breaking the grip of worldly covetousness and building faith in Jehovah Jireh.

### 3. Historical & Contextual Background
In Malachi's day, the returned exiles neglected the Temple storehouse, leading to spiritual lethargy among the Levitical priesthood. In 2 Corinthians 8-9, Paul organized an emergency relief offering for the impoverished saints in Jerusalem, modeling inter-church generosity and cross-cultural solidarity.

### 4. AI Ministry Application
- **For Preaching**: Frame giving as an act of cheerful gratitude, liberating the heart from materialism.
- **For Administration**: Ensure transparent, audited accounting so church resources directly advance the Gospel and aid the needy.
- **For Personal Reflection**: Examine financial stewardship, purposing in your heart to honor the Lord first in all earnings.`;
  }

  // 4. Faith, Trust, and Believing God
  if (p.includes('faith') || p.includes('trust') || p.includes('doubt') || p.includes('believe')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Hebrews 11:1**: "Now faith is the substance of things hoped for, the evidence of things not seen."
- **Hebrews 11:6**: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him."
- **Romans 10:17**: "So then faith cometh by hearing, and hearing by the word of God."

### 2. Biblical Interpretation & Exegesis
Historical orthodox theology defines faith (*fides*) as involving three inseparable components: *notitia* (knowledge of the truth), *assensus* (assent to its veracity), and *fiducia* (personal, saving trust in Christ). As Matthew Henry observed, true faith is not blind wishful thinking; it is the eye of the soul beholding God's infallible promise and anchoring there.

### 3. Historical & Contextual Background
The Epistle to the Hebrews was written to Jewish believers facing intense social ostracism and temptation to retreat from Christ back to ceremonial shadows. The author recites the great cloud of witnesses (Hebrews 11) to demonstrate that the righteous have always lived by persevering faith.

### 4. AI Ministry Application
- **For Preaching**: Exhort the flock that faith is strengthened not by measuring human ability, but by fixing our eyes on the faithfulness of God.
- **For Discipleship**: Feed faith through daily Scripture immersion, as faith originates and matures through the preached Word.
- **For Personal Prayer**: Pray: "Lord, increase my faith; I believe, help Thou mine unbelief (Mark 9:24)."`;
  }

  // 5. Marriage, Family, and Holy Covenant
  if (p.includes('marri') || p.includes('husband') || p.includes('wife') || p.includes('covenant') || p.includes('family') || p.includes('child')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Ephesians 5:25, 31-32**: "Husbands, love your wives, even as Christ also loved the church, and gave himself for it... For this cause shall a man leave his father and mother, and shall be joined unto his wife, and they two shall be one flesh. This is a great mystery: but I speak concerning Christ and the church."
- **Proverbs 18:22**: "Whoso findeth a wife findeth a good thing, and obtaineth favour of the LORD."
- **Colossians 3:18-21**: "Wives, submit yourselves unto your own husbands, as it is fit in the Lord. Husbands, love your wives, and be not bitter against them. Children, obey your parents in all things: for this is well pleasing unto the Lord."

### 2. Biblical Interpretation & Exegesis
Christian marriage is an earthly sacramentum—a living typological reflection of Christ's sacrificial love for His redeemed Bride. Exegetes like Jonathan Edwards and John Chrysostom described the Christian home as a "little church," where forgiveness, sacrificial service, and mutual honor bear witness to the surrounding culture.

### 3. Historical & Contextual Background
In Greco-Roman antiquity, wives and children had little legal standing under the harsh authority of the *paterfamilias*. Paul's radical instruction for husbands to love their wives with self-sacrificing devotion revolutionized marital ethics in the ancient world.

### 4. AI Ministry Application
- **For Preaching**: Uphold holy covenant marriage as a sanctuary of mutual sanctification and unconditional grace.
- **For Family Counseling**: Urge couples to pray together daily and banish bitterness before sunset (Ephesians 4:26).
- **For Anniversaries**: Celebrate longevity in marriage as a living monument of God's covenantal faithfulness.`;
  }

  // 6. Holy Spirit, Pentecost, and Spiritual Power
  if (p.includes('spirit') || p.includes('pentecost') || p.includes('ghost') || p.includes('power') || p.includes('anoint')) {
    return `### 1. Direct Scripture References (${bibleVersion})
- **Acts 1:8**: "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth."
- **Galatians 5:22-23**: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law."
- **Zechariah 4:6**: "Not by might, nor by power, but by my spirit, saith the LORD of hosts."

### 2. Biblical Interpretation & Exegesis
Holiness revivalists like A.W. Tozer emphasized that the Spirit's primary work is to glorify Jesus Christ and form holy fruit in believers. Divine power (*dunamis*) is never given for carnal display, but to empower bold, self-effacing witness and sanctify the believer's inner disposition into Christlikeness.

### 3. Historical & Contextual Background
On the Day of Pentecost (Acts 2), the arrival of the Holy Spirit with rushing wind and fire fulfilled Joel's prophecy (Joel 2:28), inaugurating the harvest age where the Spirit is poured out on all consecrated believers.

### 4. AI Ministry Application
- **For Preaching**: Remind the congregation that church programs without the Holy Spirit's breath are powerless engines.
- **For Altar Ministry**: Invite believers to seek the fresh baptism and unction of the Spirit for holy boldness.
- **For Personal Life**: Yield daily: "Holy Spirit, breathe on me, produce Your supernatural fruit, and guide my footsteps today."`;
  }

  // Default Standard Orthodox Theological Reflection
  return `### 1. Direct Scripture References (${bibleVersion})
- **Romans 8:28**: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."
- **Jeremiah 29:11**: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."
- **Proverbs 3:5-6**: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."

### 2. Biblical Interpretation & Exegesis
In the commentary tradition of Matthew Henry and Charles Spurgeon, God's sovereignty never negates human responsibility, but envelops the believer's circumstances within His redemptive purpose. Paul's declaration in Romans 8 is not a passive optimism; it is the confident decree that even afflictions, persecutions, and uncertainties are orchestrated by divine love into spiritual gold.

### 3. Historical & Contextual Background
Written by the Apostle Paul around AD 57 to the Christian assembly in Rome—a community enduring Roman imperial pressure and cultural tension. Paul anchors their confidence not in earthly comfort, but in the unshakeable eternity of Christ's triumph.

### 4. AI Ministry Application
- **For Preaching**: Encourage congregants who feel overwhelmed by current trials that delays are not denials of God's covenant.
- **For Bible Study**: Contrast worldly stoicism with joyful Christian hope rooted in the cross and resurrection.
- **For Personal Prayer**: Pray: "Lord, I surrender my current situation into Your sovereign care, trusting that You work all things for my eternal good."`;
}
