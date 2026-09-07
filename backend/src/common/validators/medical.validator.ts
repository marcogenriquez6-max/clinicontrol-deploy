export interface VitalSigns {
  temperatura?: number;
  frecuenciaCardiaca?: number;
  presionSistolica?: number;
  presionDiastolica?: number;
  frecuenciaRespiratoria?: number;
  spo2?: number;
  peso?: number;
  talla?: number;
  glasgow?: number;
}

export interface CriticalAlert {
  parameter: string;
  value: number;
  threshold: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

export class MedicalValidator {
  static isValidTemperature(temp: number): boolean {
    return temp >= 34 && temp <= 42;
  }

  static isValidHeartRate(hr: number): boolean {
    return hr >= 20 && hr <= 280;
  }

  static isValidBloodPressure(systolic: number, diastolic: number): boolean {
    return (
      systolic >= 60 &&
      systolic <= 280 &&
      diastolic >= 30 &&
      diastolic <= 160 &&
      systolic > diastolic
    );
  }

  static isValidSystolic(systolic: number): boolean {
    return systolic >= 60 && systolic <= 280;
  }

  static isValidDiastolic(diastolic: number): boolean {
    return diastolic >= 30 && diastolic <= 160;
  }

  static isValidSpO2(spo2: number): boolean {
    return spo2 >= 50 && spo2 <= 100;
  }

  static isValidRespiratoryRate(rr: number): boolean {
    return rr >= 4 && rr <= 80;
  }

  static isValidBMI(weight: number, heightCm: number): number | null {
    if (weight <= 0 || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
  }

  static isValidGlasgow(score: number): boolean {
    return score >= 3 && score <= 15;
  }

  static isValidESI(level: number): boolean {
    return level >= 1 && level <= 5;
  }

  static calculateESIVerified(level: number, vitals: VitalSigns): boolean {
    if (!this.isValidESI(level)) return false;
    if (level === 1) return true;
    if (vitals.spo2 !== undefined && vitals.spo2 < 80) return level <= 2;

    if (level === 2) {
      if (vitals.spo2 !== undefined && vitals.spo2 < 86) return true;
      if (
        vitals.frecuenciaCardiaca !== undefined &&
        (vitals.frecuenciaCardiaca < 40 || vitals.frecuenciaCardiaca > 180)
      )
        return true;
      if (
        vitals.frecuenciaRespiratoria !== undefined &&
        vitals.frecuenciaRespiratoria > 50
      )
        return true;
      if (vitals.presionSistolica !== undefined && vitals.presionSistolica < 80)
        return true;
      return false;
    }

    if (level >= 4 && level <= 5) {
      if (vitals.spo2 !== undefined && vitals.spo2 < 90) return false;
      if (
        vitals.frecuenciaCardiaca !== undefined &&
        (vitals.frecuenciaCardiaca < 50 || vitals.frecuenciaCardiaca > 140)
      )
        return false;
    }

    return true;
  }

  static checkCriticalValues(vitals: VitalSigns): CriticalAlert[] {
    const alerts: CriticalAlert[] = [];

    if (vitals.temperatura !== undefined) {
      if (vitals.temperatura > 41) {
        alerts.push({
          parameter: 'temperatura',
          value: vitals.temperatura,
          threshold: '> 41°C',
          severity: 'CRITICAL',
          message: `Hiperpirexia crítica: ${vitals.temperatura}°C`,
        });
      } else if (vitals.temperatura > 39.5) {
        alerts.push({
          parameter: 'temperatura',
          value: vitals.temperatura,
          threshold: '> 39.5°C',
          severity: 'HIGH',
          message: `Fiebre alta: ${vitals.temperatura}°C`,
        });
      } else if (vitals.temperatura < 35) {
        alerts.push({
          parameter: 'temperatura',
          value: vitals.temperatura,
          threshold: '< 35°C',
          severity: 'HIGH',
          message: `Hipotermia: ${vitals.temperatura}°C`,
        });
      }
    }

    if (vitals.spo2 !== undefined) {
      if (vitals.spo2 < 80) {
        alerts.push({
          parameter: 'spo2',
          value: vitals.spo2,
          threshold: '< 80%',
          severity: 'CRITICAL',
          message: `Hipoxemia severa: SpO2 ${vitals.spo2}%`,
        });
      } else if (vitals.spo2 < 86) {
        alerts.push({
          parameter: 'spo2',
          value: vitals.spo2,
          threshold: '< 86%',
          severity: 'HIGH',
          message: `Hipoxemia: SpO2 ${vitals.spo2}%`,
        });
      }
    }

    if (vitals.frecuenciaCardiaca !== undefined) {
      if (vitals.frecuenciaCardiaca > 180) {
        alerts.push({
          parameter: 'frecuenciaCardiaca',
          value: vitals.frecuenciaCardiaca,
          threshold: '> 180 lpm',
          severity: 'CRITICAL',
          message: `Taquicardia crítica: ${vitals.frecuenciaCardiaca} lpm`,
        });
      } else if (vitals.frecuenciaCardiaca < 40) {
        alerts.push({
          parameter: 'frecuenciaCardiaca',
          value: vitals.frecuenciaCardiaca,
          threshold: '< 40 lpm',
          severity: 'CRITICAL',
          message: `Bradicardia crítica: ${vitals.frecuenciaCardiaca} lpm`,
        });
      }
    }

    if (vitals.presionSistolica !== undefined) {
      if (vitals.presionSistolica < 80) {
        alerts.push({
          parameter: 'presionSistolica',
          value: vitals.presionSistolica,
          threshold: '< 80 mmHg',
          severity: 'CRITICAL',
          message: `Hipotensión severa: PAS ${vitals.presionSistolica} mmHg`,
        });
      } else if (vitals.presionSistolica > 220) {
        alerts.push({
          parameter: 'presionSistolica',
          value: vitals.presionSistolica,
          threshold: '> 220 mmHg',
          severity: 'CRITICAL',
          message: `Crisis hipertensiva: PAS ${vitals.presionSistolica} mmHg`,
        });
      }
    }

    if (vitals.frecuenciaRespiratoria !== undefined) {
      if (vitals.frecuenciaRespiratoria > 40) {
        alerts.push({
          parameter: 'frecuenciaRespiratoria',
          value: vitals.frecuenciaRespiratoria,
          threshold: '> 40 rpm',
          severity: 'CRITICAL',
          message: `Taquipnea crítica: ${vitals.frecuenciaRespiratoria} rpm`,
        });
      } else if (vitals.frecuenciaRespiratoria < 8) {
        alerts.push({
          parameter: 'frecuenciaRespiratoria',
          value: vitals.frecuenciaRespiratoria,
          threshold: '< 8 rpm',
          severity: 'CRITICAL',
          message: `Bradipnea crítica: ${vitals.frecuenciaRespiratoria} rpm`,
        });
      }
    }

    return alerts;
  }

  static classifyBloodPressure(systolic: number, diastolic: number): string {
    if (systolic >= 180 || diastolic >= 120) return 'Crisis hipertensiva';
    if (systolic >= 140 || diastolic >= 90) return 'Hipertensión';
    if (systolic >= 130 || diastolic >= 80) return 'Prehipertensión';
    if (systolic < 90 || diastolic < 60) return 'Hipotensión';
    return 'Normal';
  }
}
