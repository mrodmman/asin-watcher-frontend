import React, { useRef, useState } from 'react';
import { ProductForScript, CouponImageStyle } from '../types';
import { downloadImage, colorSchemes, getRandomColorScheme } from '../services/imageUtils';

interface Props {
  product: ProductForScript;
  initialStyle?: Partial<CouponImageStyle>;
}

const CouponImageGenerator: React.FC<Props> = ({ product, initialStyle }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  
  const defaultScheme = getRandomColorScheme();
  const [style, setStyle] = useState<CouponImageStyle>({
    type: initialStyle?.type || 'gradient',
    primaryColor: initialStyle?.primaryColor || defaultScheme.primary,
    secondaryColor: initialStyle?.secondaryColor || defaultScheme.secondary,
    emoji: initialStyle?.emoji || defaultScheme.emoji,
    showProductName: initialStyle?.showProductName ?? true,
    showDiscount: initialStyle?.showDiscount ?? true,
  });

  const handleDownload = async () => {
    if (!imageRef.current) return;
    setDownloading(true);
    try {
      await downloadImage(
        imageRef.current, 
        `coupon-${product.code.replace(/[^a-z0-9]/gi, '')}.png`
      );
    } catch (error) {
      alert('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  const getBackgroundStyle = () => {
    if (style.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor || style.primaryColor} 100%)`
      };
    } else if (style.type === 'solid') {
      return {
        backgroundColor: style.primaryColor
      };
    } else {
      // Minimal
      return {
        backgroundColor: '#ffffff',
        border: `4px solid ${style.primaryColor}`
      };
    }
  };

  const getTextColor = () => {
    return style.type === 'minimal' ? style.primaryColor : '#ffffff';
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          ref={imageRef}
          className="relative"
          style={{
            width: '400px',
            height: '400px',
            ...getBackgroundStyle(),
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: '64px' }}>
            {style.emoji}
          </div>

          {/* Discount Badge (if enabled) */}
          {style.showDiscount && product.discount && parseFloat(product.discount) > 0 && (
            <div 
              style={{
                color: getTextColor(),
                fontSize: '32px',
                fontWeight: '800',
                textAlign: 'center',
                textShadow: style.type !== 'minimal' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              SAVE {Math.round(parseFloat(product.discount))}%
            </div>
          )}

          {/* Coupon Code */}
          <div
            style={{
              color: getTextColor(),
              fontSize: '48px',
              fontWeight: '900',
              textAlign: 'center',
              letterSpacing: '2px',
              fontFamily: 'monospace',
              textShadow: style.type !== 'minimal' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {product.code}
          </div>

          {/* Call to Action */}
          <div
            style={{
              color: getTextColor(),
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center',
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Use This Code
          </div>

          {/* Product Name (if enabled) */}
          {style.showProductName && (
            <div
              style={{
                color: getTextColor(),
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
                opacity: 0.8,
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {product.cleanName}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-sm text-gray-700">Customize Image</h4>
        
        {/* Style Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Style</label>
          <div className="flex gap-2">
            {(['gradient', 'solid', 'minimal'] as const).map(type => (
              <button
                key={type}
                onClick={() => setStyle(s => ({ ...s, type }))}
                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize ${
                  style.type === type 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Color Scheme Presets */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Color Theme</label>
          <div className="grid grid-cols-4 gap-2">
            {colorSchemes.map(scheme => (
              <button
                key={scheme.name}
                onClick={() => setStyle(s => ({
                  ...s,
                  primaryColor: scheme.primary,
                  secondaryColor: scheme.secondary,
                  emoji: scheme.emoji
                }))}
                className="p-2 rounded-lg border-2 hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`,
                  borderColor: style.primaryColor === scheme.primary ? '#000' : 'transparent'
                }}
                title={scheme.name}
              >
                <span className="text-2xl">{scheme.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Emoji</label>
          <input
            type="text"
            value={style.emoji}
            onChange={(e) => setStyle(s => ({ ...s, emoji: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-2xl text-center"
            maxLength={2}
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <input
              type="checkbox"
              checked={style.showProductName}
              onChange={(e) => setStyle(s => ({ ...s, showProductName: e.target.checked }))}
              className="rounded"
            />
            Show Product Name
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <input
              type="checkbox"
              checked={style.showDiscount}
              onChange={(e) => setStyle(s => ({ ...s, showDiscount: e.target.checked }))}
              className="rounded"
            />
            Show Discount
          </label>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 disabled:opacity-50"
        >
          {downloading ? 'Generating...' : '⬇️ Download Coupon Image'}
        </button>
      </div>
    </div>
  );
};

export default CouponImageGenerator;
