import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { API_BASE_URL, getPredictUrl } from '@/constants/api';

import Header from '../components/Header';

type PredictionResult = {
  confidence: number;
  prediction: string;
};

export default function Results() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const age = String(params.age ?? '');
  const esr = String(params.ESR ?? '');
  const crp = String(params.CRP ?? '');
  const rf = String(params.RF ?? '');
  const c3 = String(params.C3 ?? '');
  const c4 = String(params.C4 ?? '');
  const gender = String(params.gender ?? '');
  const antiCCP = String(params.antiCCP ?? '');
  const hlaB27 = String(params.HLAB27 ?? '');
  const ana = String(params.ANA ?? '');
  const antiRo = String(params.antiRo ?? '');
  const antiLa = String(params.antiLa ?? '');
  const antiDsDNA = String(params.antiDsDNA ?? '');
  const antiSm = String(params.antiSm ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchPrediction() {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          Age: Number(age),
          ESR: Number(esr),
          CRP: Number(crp),
          RF: Number(rf),
          C3: Number(c3),
          C4: Number(c4),
          Gender: gender,
          Anti_CCP: antiCCP,
          HLA_B27: hlaB27,
          ANA: ana,
          Anti_Ro: antiRo,
          Anti_La: antiLa,
          Anti_dsDNA: antiDsDNA,
          Anti_Sm: antiSm,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(getPredictUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Prediction request failed.');
        }

        if (active) {
          setResult({
            prediction: String(data.prediction),
            confidence: Number(data.confidence),
          });
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error && err.name === 'AbortError'
              ? 'The backend took too long to respond. On Render free tier, the first request can be slow while the server wakes up.'
              : err instanceof Error
                ? err.message
                : 'Something went wrong.';
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchPrediction();

    return () => {
      active = false;
    };
  }, [age, esr, crp, rf, c3, c4, gender, antiCCP, hlaB27, ana, antiRo, antiLa, antiDsDNA, antiSm, requestKey]);

  return (
    <View style={styles.container}>
      <Header title="Results" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>Prediction Result</Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6c63ff" />
            <Text style={styles.helper}>
              Contacting the deployed ML API. The first request can take time if Render is waking up.
            </Text>
          </View>
        ) : error ? (
          <View>
            <Text style={styles.errorTitle}>Prediction failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.helper}>API Base URL: {API_BASE_URL}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                setRequestKey((value) => value + 1);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.resultLabel}>Predicted disease</Text>
            <Text style={styles.resultValue}>{result?.prediction ?? 'Unknown'}</Text>

            <Text style={styles.resultLabel}>Confidence</Text>
            <Text style={styles.resultValue}>
              {Math.round((result?.confidence ?? 0) * 100)}%
            </Text>

            <Text style={styles.helper}>
              This result is coming from your FastAPI backend on Render.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f7' },
  card: {
    backgroundColor: '#e6def2',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a4a8a',
    marginTop: 4,
  },
  helper: {
    marginTop: 16,
    color: '#555',
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b00020',
  },
  errorText: {
    marginTop: 10,
    color: '#333',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
