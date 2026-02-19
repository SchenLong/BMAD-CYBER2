/**
 * Code Snippet Component
 * Story 8.5: API Explorer
 * Task 7: Code Snippet Generation
 *
 * Generates cURL, JavaScript, and Python code for API requests
 */

"use client"

import { useApiExplorerStore } from '@/stores/api-explorer-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CodeSnippet() {
  const { response, selectedEndpoint, pathParams, queryParams, headers, body } =
    useApiExplorerStore();
  const [copied, setCopied] = useState<string | null>(null);

  if (!response || !selectedEndpoint) {
    return null;
  }

  // Build full URL for display
  let url = `/api/v1${selectedEndpoint.path}`;
  Object.entries(pathParams).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  });
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });
  if (searchParams.toString()) {
    url += `?${searchParams.toString()}`;
  }

  // Generate cURL
  const curlCode = generateCurl(selectedEndpoint.method, url, headers, body);

  // Generate JavaScript
  const jsCode = generateJavaScript(selectedEndpoint.method, url, headers, body);

  // Generate Python
  const pythonCode = generatePython(selectedEndpoint.method, url, headers, body);

  const handleCopy = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(language);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Code Snippet</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList className="w-full">
            <TabsTrigger value="curl" className="flex-1">
              cURL
            </TabsTrigger>
            <TabsTrigger value="javascript" className="flex-1">
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="python" className="flex-1">
              Python
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curl">
            <CodeBlock
              code={curlCode}
              onCopy={() => handleCopy(curlCode, 'curl')}
              isCopied={copied === 'curl'}
            />
          </TabsContent>

          <TabsContent value="javascript">
            <CodeBlock
              code={jsCode}
              onCopy={() => handleCopy(jsCode, 'javascript')}
              isCopied={copied === 'javascript'}
            />
          </TabsContent>

          <TabsContent value="python">
            <CodeBlock
              code={pythonCode}
              onCopy={() => handleCopy(pythonCode, 'python')}
              isCopied={copied === 'python'}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function generateCurl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  let curl = `curl -X ${method} "${window.location.origin}${url}"`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });

  // Add body
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    curl += ` \\\n  -d '${body}'`;
  }

  return curl;
}

function generateJavaScript(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  let code = `fetch("${window.location.origin}${url}", {\n`;
  code += `  method: "${method}",\n`;
  code += `  headers: {\n`;

  const headerEntries = Object.entries(headers);
  headerEntries.forEach(([key, value], index) => {
    const comma = index < headerEntries.length - 1 ? ',' : '';
    code += `    "${key}": "${value}"${comma}\n`;
  });

  code += `  }\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `});\n\n`;
    try {
      const parsed = JSON.parse(body);
      code += `  body: JSON.stringify(${JSON.stringify(parsed, null, 2)}, null, 2),\n`;
    } catch {
      code += `  body: "${body}",\n`;
    }
    code += `});\n\n`;
    code += `const data = await response.json();\nconsole.log(data);`;
  } else {
    code += `});\n\n`;
    code += `const data = await response.json();\nconsole.log(data);`;
  }

  return code;
}

function generatePython(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  let code = `import requests\n\n`;
  code += `url = "${window.location.origin}${url}"\n`;
  code += `headers = ${JSON.stringify(headers, null, 2)}\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `data = ${body}\n`;
  }

  code += `\nresponse = requests.${method.toLowerCase()}(url`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `, json=data`;
  }

  code += `, headers=headers)\n`;
  code += `print(response.json())`;

  return code;
}

function CodeBlock({
  code,
  onCopy,
  isCopied,
}: {
  code: string;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={onCopy}
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
