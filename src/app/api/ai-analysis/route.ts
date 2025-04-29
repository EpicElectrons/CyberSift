import { NextResponse } from "next/server";
import { extractFeaturesFromEvidence, predictAttack } from "@/lib/ml/service";
import { 
  getEvidenceById, 
  createAIAnalysis, 
  getAIAnalysis, 
  createMLPrediction, 
  getMLPredictionByEvidenceId 
} from "@/db/schema";

/**
 * Generate explanation based on attack type
 * @param attackType Attack type or null
 * @returns Human-readable explanation
 */
function generateExplanation(attackType?: string | null): string {
  if (!attackType) {
    return "The analysis detected suspicious activities that require further investigation. Multiple indicators suggest potential security risks.";
  }
  
  const explanations: Record<string, string> = {
    'Ransomware': 'Analysis detected file encryption patterns and suspicious registry modifications consistent with ransomware activity.',
    'DDoS': 'Evidence shows abnormal network traffic patterns consistent with Distributed Denial of Service attack.',
    'SQLi': 'Multiple SQL injection attempts detected in web server logs targeting database backends.',
    'XSS': 'Cross-site scripting payloads identified in HTTP request logs, attempting to execute malicious client-side code.',
    'Phishing': 'Evidence contains social engineering techniques designed to harvest credentials and sensitive information.',
    'Malware': 'Binary analysis reveals obfuscated code with suspicious behavior patterns consistent with known malware families.',
    'Brute Force': 'Multiple failed authentication attempts detected in sequence, suggesting password guessing attacks.',
    'Zero-day Exploit': 'Novel attack patterns detected exploiting previously unknown vulnerabilities in the system.',
    'Data Exfiltration': 'Unusual outbound data transfers containing potentially sensitive information detected.',
    'Supply Chain Attack': 'Evidence suggests compromise of trusted software distribution channels to deliver malicious code.'
  };
  
  return explanations[attackType] || 
    "The forensic analysis identified suspicious activities that match patterns associated with known cyber threats. Further investigation is recommended.";
}

/**
 * POST /api/ai-analysis - Run AI analysis on evidence
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evidenceId } = body;

    if (!evidenceId) {
      return NextResponse.json(
        { error: "Evidence ID is required" },
        { status: 400 }
      );
    }

    // Check if evidence exists
    const evidenceData = await getEvidenceById(evidenceId);
    if (!evidenceData) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      );
    }

    // Extract features from the evidence for ML prediction
    const features = extractFeaturesFromEvidence(evidenceData);
    
    // Call the ML model to predict attack
    const predictionResult = await predictAttack(features);
    
    // Save ML prediction
    await createMLPrediction({
      evidenceId,
      isAttack: predictionResult.isAttack,
      attackType: predictionResult.attackType || null,
      confidence: predictionResult.confidence,
      featureImportance: predictionResult.featureImportance || null,
      anomalyScore: predictionResult.anomalyScore,
      modelUsed: predictionResult.modelUsed
    });

    // Generate explanation based on prediction
    const explanation = generateExplanation(predictionResult.attackType || null);

    // Create AI analysis entry
    const analysisData = {
      evidenceId,
      confidence: Math.round(predictionResult.confidence),
      detectedAttackType: predictionResult.attackType,
      anomalyScore: Math.round(predictionResult.anomalyScore),
      featureImportance: predictionResult.featureImportance,
      explanation
    };

    const newAnalysis = await createAIAnalysis(analysisData);

    return NextResponse.json({
      success: true,
      analysis: newAnalysis,
      mlPrediction: predictionResult
    });
  } catch (error) {
    console.error("Error creating AI analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-analysis - Get AI analysis for evidence
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('evidenceId');

    if (!evidenceId) {
      return NextResponse.json(
        { error: "Evidence ID is required" },
        { status: 400 }
      );
    }

    const evidenceIdNum = parseInt(evidenceId);
    if (isNaN(evidenceIdNum)) {
      return NextResponse.json(
        { error: "Invalid evidence ID" },
        { status: 400 }
      );
    }

    // First check if we have an existing analysis
    const analysis = await getAIAnalysis(evidenceIdNum);

    // If analysis exists, return it along with ML prediction
    if (analysis) {
      // Get ML prediction if available
      const mlPrediction = await getMLPredictionByEvidenceId(evidenceIdNum);
      
      return NextResponse.json({
        success: true,
        analysis,
        mlPrediction
      });
    }

    // If no analysis exists, check if evidence exists
    const evidenceData = await getEvidenceById(evidenceIdNum);
    if (!evidenceData) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      );
    }
    
    // Extract features and run prediction
    const features = extractFeaturesFromEvidence(evidenceData);
    const predictionResult = await predictAttack(features);
    
    // Save ML prediction
    const mlPrediction = await createMLPrediction({
      evidenceId: evidenceIdNum,
      isAttack: predictionResult.isAttack,
      attackType: predictionResult.attackType,
      confidence: predictionResult.confidence,
      featureImportance: predictionResult.featureImportance,
      anomalyScore: predictionResult.anomalyScore,
      modelUsed: predictionResult.modelUsed
    });

    // Generate explanation
    const explanation = generateExplanation(predictionResult.attackType);

    // Create and save AI analysis
    const analysisData = {
      evidenceId: evidenceIdNum,
      confidence: Math.round(predictionResult.confidence),
      detectedAttackType: predictionResult.attackType,
      anomalyScore: Math.round(predictionResult.anomalyScore),
      featureImportance: predictionResult.featureImportance,
      explanation
    };
    
    const newAnalysis = await createAIAnalysis(analysisData);
    
    return NextResponse.json({
      success: true,
      analysis: newAnalysis,
      mlPrediction
    });
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
