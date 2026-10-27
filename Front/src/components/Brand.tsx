import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Marca vetorial compartilhada: perfil equino e cabeça bovina. */
export function LivestockMark({ size = 46, light = false, seal = false }: { size?: number; light?: boolean; seal?: boolean }) {
  const primary = light ? '#F1E9D4' : '#244D3D';
  const secondary = light ? '#C8AD79' : '#A07E47';
  const cut = light ? '#244D3D' : '#FAF9F6';
  return <Svg width={size} height={size} viewBox="0 0 240 240">
    {seal && <>
      <Circle cx="120" cy="120" r="112" stroke={secondary} strokeWidth="0.8" opacity={0.45} fill="none" />
      <Circle cx="120" cy="120" r="101" stroke={secondary} strokeWidth="0.5" opacity={0.25} fill="none" />
    </>}
    <Path d="M106 190H47C62 176 76 159 79 142L84 115C74 122 65 119 59 113L38 103C31 100 28 94 32 87L55 61L68 55L65 28L81 43L92 23L97 53C115 64 122 85 119 111C117 137 104 158 106 190Z" fill={primary} />
    <Path d="M98 58C115 73 118 90 114 111C112 125 107 139 104 151" stroke={secondary} strokeWidth="5" strokeLinecap="round" fill="none" />
    <Path d="M69 80L76 78M39 96L49 99" stroke={cut} strokeWidth="4" strokeLinecap="round" />
    <Path d="M145 80C132 79 122 66 125 48C133 62 143 65 154 64L168 60L183 64C195 65 205 62 213 48C216 66 206 79 193 80L189 96C191 112 187 125 181 135L179 155H157L155 135C149 125 145 112 147 96Z" fill={secondary} />
    <Path d="M148 88C139 79 129 80 126 85C131 94 139 98 148 96M190 88C199 79 209 80 212 85C207 94 199 98 190 96" fill={secondary} />
    <Path d="M156 103L160 105M178 105L182 103" stroke={cut} strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M156 133Q168 128 180 133L181 142Q168 151 155 142Z" fill={cut} />
    <Path d="M161 138H163M173 138H175" stroke={secondary} strokeWidth="3" strokeLinecap="round" />
    <Path d="M148 162C138 168 130 180 128 190H207C205 180 197 168 187 162L176 169H160Z" fill={secondary} />
    <Path d="M45 201H207" stroke={secondary} strokeWidth="1.4" opacity={0.7} />
  </Svg>;
}

export function Brand({ light = false }: { light?: boolean }) {
  return <View style={styles.brand} accessible accessibilityLabel="SEMEARAS">
    <LivestockMark light={light} />
    <Text style={[styles.name, { color: light ? '#F1E9D4' : '#244D3D' }]}>SEMEARAS</Text>
  </View>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 21, fontWeight: '700', letterSpacing: 3 },
});
