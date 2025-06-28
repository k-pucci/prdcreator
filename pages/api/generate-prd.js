export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { formData, uploadedFiles } = req.body;
  
  // Check if Claude API key is available
  if (!process.env.CLAUDE_API_KEY) {
    console.log('No Claude API key found, using template fallback');
    return generateTemplatePRD(formData, uploadedFiles, res);
  }

  // Try Claude API first
  try {
    const claudeResponse = await generateClaudePRD(formData, uploadedFiles);
    return res.json({ prd: claudeResponse, source: 'claude' });
  } catch (error) {
    console.error('Claude API failed, falling back to template:', error);
    return generateTemplatePRD(formData, uploadedFiles, res);
  }
}

// Claude API function
async function generateClaudePRD(formData, uploadedFiles) {
  // Build the context from uploaded files
  let fileContext = '';
  if (uploadedFiles && uploadedFiles.length > 0) {
    fileContext = '\n\nAdditional Context from Uploaded Files:\n';
    uploadedFiles.forEach((file, index) => {
      fileContext += `\n--- File ${index + 1}: ${file.name} ---\n${file.content}\n`;
    });
  }

  const prompt = `Create a professional PRD based on these inputs following the company template format:

1. Product/Feature: ${formData.question1}
2. Target Users & Problem: ${formData.question2}
3. Key Features & Success Metrics: ${formData.question3}
4. Technology Stack & Integrations: ${formData.question4}
5. Out of Scope Items: ${formData.question5}
6. Timeline & Development Phases: ${formData.question6}
7. Risks, Challenges & Dependencies: ${formData.question7}
8. Business Requirements & Strategic Alignment: ${formData.question8}${fileContext}

${uploadedFiles && uploadedFiles.length > 0 ? 
  'IMPORTANT: Use the uploaded files to supplement and enhance the PRD. Extract additional details, requirements, context, and insights from the files to create a more comprehensive document. The files may contain transcripts, documentation, or other relevant information that should be integrated into the appropriate sections.' : 
  ''
}

Use this template structure and format, filling in all sections with specific details based on the inputs provided:

# [PROJECT_NAME] - Summary, Scope, and Key Decisions

**Date:** ${new Date().toLocaleDateString()}
**Participants:** Product Team, Engineering Team, Design Team

## Executive Summary
[Comprehensive overview covering: what the product/feature is, who the target users are, the core problem being solved, key functionality being delivered, and expected business outcomes. ${uploadedFiles && uploadedFiles.length > 0 ? 'Incorporate insights from uploaded files.' : ''}]

## Key Decisions Made

### Product Strategy
**Target Audience:** [Specific user segment from input 2]
**Core Problem:** [Main problem statement from input 2]
**Value Proposition:** [Key value delivered from inputs 1 and 3]
**Success Definition:** [Success metrics from input 3]

### User Experience & Interface
#### User Journey (Multi-Step Process)
**Discovery & Onboarding**
- [How users discover and start using the feature]
- [Initial setup or configuration needed]
- User Action: [Specific onboarding actions required]

**Core Usage & Engagement**
- [Primary user workflows and interactions]
- [Key feature utilization patterns]
- Demo Notes: [Key demo scenarios for stakeholders]
- User Action: [Main user actions during regular use]

### Core Features
**[Feature 1]:** [Detailed description and user value]
**[Feature 2]:** [Detailed description and user value]
**[Feature 3]:** [Detailed description and user value]
**[Feature 4]:** [Detailed description and user value]
Demo Notes: [Critical features to demonstrate to stakeholders]

### Technical Implementation
**Technology Stack:** [Technology choices from input 4]
**Key Integrations:** [Integration requirements from input 4]
Demo Notes: [Technical capabilities to showcase]

### Development Strategy
**Development Approach:** [Methodology based on input 6]
**Phase Structure:** [Phase breakdown from input 6]
Demo Notes: [Milestone demonstration plan]
**Integration Strategy:** [How it fits with existing systems from input 4]
**Resource Requirements:** [Team and resource needs]

**Timeline Breakdown:**
[Parse input 6 and create detailed timeline with specific teams and deliverables]

**Total:** [Total project duration from input 6]

## Technical Specifications

### Architecture & Platform
**Technology Stack:** [Detailed tech stack from input 4]
**Integration Points:** [Specific integrations from input 4]
**Performance Requirements:** [Performance considerations implied by features]

### Data & Storage
**Data Models:** [Data requirements based on features from input 3]
**Storage Requirements:** [Database/storage needs from input 4]
**Security Considerations:** [Security measures from inputs 4 and 8]

### APIs & Interfaces
**External APIs:** [Third-party integrations from input 4]
**Internal APIs:** [System interfaces from input 4]
**User Interface:** [UI approach from input 4]

## Scope Boundaries

### Out of Scope / Not Supported
[Transform input 5 into structured out-of-scope items with explanations]

## Feature Prioritization Framework

### Layer 1: Essential Foundation ("Core Engine")
**Description:** Must-have features for basic functionality and user value
[Extract must-have features from inputs 3 and 6]

**Timeline:** [Phase 1 dates from input 6]

### Layer 2: Value Enhancement ("Polish & Power")
**Description:** Important features that significantly improve user experience
[Extract enhancement features from inputs 3 and 6]

**Timeline:** [Phase 2 dates from input 6]

### Layer 3: Future Enhancements
**Description:** Nice-to-have features for future consideration
[Extract future features from inputs 3 and 5]

## Business Context & Strategic Alignment

### Primary Business Objectives
[Extract business objectives from input 8]

### Strategic Priorities
[Extract strategic alignment from input 8]

### Value Propositions Validated
[Combine insights from inputs 2, 3, and 8]

## Implementation Approach

### Timeline & Methodology
[Based on input 6]

### Communication Plan
**Weekly Standups:** Progress tracking and blocker resolution
**Sprint Reviews:** Demo and stakeholder feedback sessions
**Documentation:** Centralized documentation and version control approach

### Quality Assurance
**Unit Testing:** Automated test coverage approach
**Integration Testing:** End-to-end user journey validation
**User Testing:** Feedback collection with target users

## Open Items & Next Steps

### Immediate Actions
[Based on typical next steps for this type of project]

### Decisions Pending
[Extract pending decisions from input 7]

### Risk Mitigation
[Transform input 7 into structured risk mitigation strategies]

## Meeting Outcomes
Clear alignment achieved on product vision, target users, core functionality, and technical approach. All stakeholders understand the scope boundaries, timeline, and their roles in delivery.

Strong consensus on the phased development approach, which balances early value delivery with manageable complexity and allows for iterative feedback incorporation.

${uploadedFiles && uploadedFiles.length > 0 ? 
  '\n## Supporting Documentation\nThis PRD was enhanced with insights from the following uploaded files:\n' + 
  uploadedFiles.map((file, index) => `- ${file.name}`).join('\n') : 
  ''
}

IMPORTANT: Replace ALL bracketed placeholders with specific, detailed content based on the 8 inputs provided and uploaded files. Be concrete and actionable rather than generic. Extract specific details from each input and organize them appropriately within the template structure.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Template fallback function (enhanced to handle uploaded files)
function generateTemplatePRD(formData, uploadedFiles, res) {
  const projectName = formData.question1.split(' ').slice(0, 3).join(' ');
  
  // Extract insights from uploaded files for template
  let fileInsights = '';
  let additionalContext = '';
  
  if (uploadedFiles && uploadedFiles.length > 0) {
    fileInsights = '\n\n## Additional Insights from Uploaded Files\n';
    uploadedFiles.forEach((file, index) => {
      fileInsights += `\n### ${file.name}\n`;
      // Extract key points from file content (simplified approach)
      const content = file.content.toLowerCase();
      if (content.includes('user') || content.includes('customer')) {
        fileInsights += '- Contains user/customer insights\n';
      }
      if (content.includes('feature') || content.includes('functionality')) {
        fileInsights += '- Details additional features and functionality\n';
      }
      if (content.includes('timeline') || content.includes('schedule')) {
        fileInsights += '- Includes timeline and scheduling information\n';
      }
      if (content.includes('risk') || content.includes('challenge')) {
        fileInsights += '- Identifies risks and challenges\n';
      }
      if (content.includes('integration') || content.includes('api')) {
        fileInsights += '- Covers integration requirements\n';
      }
    });
    
    additionalContext = ` (Enhanced with ${uploadedFiles.length} supporting document${uploadedFiles.length > 1 ? 's' : ''})`;
  }
  
  const templatePRD = `# ${projectName}${additionalContext} - Summary, Scope, and Key Decisions

**Date:** ${new Date().toLocaleDateString()}
**Participants:** Product Team, Engineering Team, Design Team

## Executive Summary
This project delivers ${formData.question1} to address the core challenges faced by ${formData.question2}. The solution will provide ${formData.question3.split('.')[0]} with a focus on measurable impact and user value.${uploadedFiles && uploadedFiles.length > 0 ? ' This PRD has been enhanced with insights from uploaded supporting documentation.' : ''}

## Key Decisions Made

### Product Strategy
**Target Audience:** ${formData.question2.split(' who ')[0] || formData.question2}
**Core Problem:** ${formData.question2.includes(' who ') ? formData.question2.split(' who ')[1] : 'Improving efficiency and user experience'}
**Value Proposition:** ${formData.question1} that delivers ${formData.question3.split('Success')[0]}
**Success Definition:** ${formData.question3.includes('Success') ? formData.question3.split('Success')[1].replace('measured by', '').trim() : 'Improved user satisfaction and operational efficiency'}

### User Experience & Interface
#### User Journey (Multi-Step Process)
**Discovery & Onboarding**
- Users discover the solution through ${formData.question2.includes('managers') ? 'management channels' : 'organic adoption'}
- Initial setup requires basic configuration and account creation
- User Action: Complete onboarding flow and initial preferences

**Core Usage & Engagement**
- Primary workflow involves ${formData.question3.split(',')[0] || 'core feature utilization'}
- Users engage with ${formData.question3.split(',')[1] || 'key functionality'} regularly
- Demo Notes: Focus on core user journey and value demonstration
- User Action: Daily/weekly usage of primary features

### Core Features
**${formData.question3.split(',')[0] || 'Core Feature 1'}:** Primary functionality that addresses user needs
**${formData.question3.split(',')[1] || 'Feature 2'}:** Secondary feature that enhances user experience
**${formData.question3.split(',')[2] || 'Integration Feature'}:** Connects with existing workflows
**${formData.question3.split(',')[3] || 'Analytics Feature'}:** Provides insights and metrics
Demo Notes: Highlight key features that differentiate from existing solutions

### Technical Implementation
**Technology Stack:** ${formData.question4}
**Key Integrations:** ${formData.question4.includes('integrates') ? formData.question4.split('integrates')[1] : 'Standard API integrations'}
Demo Notes: Showcase technical capabilities and performance

### Development Strategy
**Development Approach:** ${formData.question6.includes('Phase') ? 'Phased delivery approach' : 'Iterative development methodology'}
**Phase Structure:** ${formData.question6}
Demo Notes: Progressive feature rollout and milestone demonstrations
**Integration Strategy:** ${formData.question4.includes('backend') ? 'Backend-first integration' : 'Frontend-driven implementation'}
**Resource Requirements:** Cross-functional team with frontend, backend, and design expertise

**Timeline Breakdown:**
${formData.question6.split(',').map(phase => `- ${phase.trim()}`).join('\n')}

**Total:** ${formData.question6.includes('weeks') ? formData.question6.match(/\d+\s*weeks?/g)?.reduce((acc, curr) => acc + parseInt(curr), 0) + ' weeks' : '12-16 weeks'}

## Technical Specifications

### Architecture & Platform
**Technology Stack:** ${formData.question4}
**Integration Points:** ${formData.question4.includes('API') ? 'RESTful APIs and webhook integrations' : 'Standard integration protocols'}
**Performance Requirements:** Sub-second response times and 99.9% uptime

### Data & Storage
**Data Models:** User profiles, activity logs, ${formData.question3.includes('tracking') ? 'tracking data' : 'application data'}
**Storage Requirements:** ${formData.question4.includes('database') ? formData.question4.split('database')[0] + 'database' : 'Scalable cloud database solution'}
**Security Considerations:** ${formData.question8.includes('compliance') ? 'Industry compliance requirements' : 'Standard security protocols and data encryption'}

### APIs & Interfaces
**External APIs:** ${formData.question4.includes('integrates') ? formData.question4.split('integrates')[1] : 'Third-party service integrations'}
**Internal APIs:** RESTful API architecture for frontend-backend communication
**User Interface:** ${formData.question4.includes('React') ? 'React-based responsive web interface' : 'Modern responsive web interface'}

## Scope Boundaries

### Out of Scope / Not Supported
**${formData.question5.split(',')[0] || 'Advanced Features'}:** ${formData.question5.split(',')[0] || 'Complex functionality'} excluded for initial release
- Focus on core functionality first
- Advanced features planned for future phases

**${formData.question5.split(',')[1] || 'Platform Extensions'}:** ${formData.question5.split(',')[1] || 'Additional platforms'} not included
- Web-first approach for initial launch
- Platform expansion in subsequent releases

**${formData.question5.split(',')[2] || 'Enterprise Features'}:** ${formData.question5.split(',')[2] || 'Complex enterprise functionality'} deferred
- Standard user workflows prioritized
- Enterprise features planned for later versions

## Feature Prioritization Framework

### Layer 1: Essential Foundation ("Core Engine")
**Description:** Must-have features for basic functionality and user value
- ${formData.question3.split(',')[0] || 'Core functionality'}
- ${formData.question3.split(',')[1] || 'User interface'}
- ${formData.question4.includes('API') ? 'API integrations' : 'Basic integrations'}
- User authentication and security
- Basic analytics and monitoring

**Timeline:** ${formData.question6.split(',')[0] || 'Phase 1: 4-6 weeks'}

### Layer 2: Value Enhancement ("Polish & Power")
**Description:** Important features that significantly improve user experience
- ${formData.question3.split(',')[2] || 'Enhanced features'}
- Advanced user interface elements
- Extended integration capabilities

**Timeline:** ${formData.question6.split(',')[1] || 'Phase 2: 3-4 weeks'}

### Layer 3: Future Enhancements
**Description:** Nice-to-have features for future consideration
- ${formData.question5.includes('mobile') ? 'Mobile applications' : 'Platform extensions'}
- Advanced analytics and reporting

## Business Context & Strategic Alignment

### Primary Business Objectives
**Operational Efficiency:** ${formData.question8.includes('efficiency') ? 'Improve operational efficiency' : 'Streamline business processes'}
**User Experience:** ${formData.question8.includes('user') ? 'Enhance user experience' : 'Improve user satisfaction'}
**Strategic Goals:** ${formData.question8}

### Strategic Priorities
**Technology Modernization:** ${formData.question4.includes('modern') ? 'Leverage modern technology stack' : 'Update technology infrastructure'}
**Process Optimization:** ${formData.question2.includes('struggle') ? 'Address current process inefficiencies' : 'Optimize existing workflows'}
**Competitive Advantage:** ${formData.question3.includes('measured') ? 'Measurable competitive improvements' : 'Strategic market positioning'}

### Value Propositions Validated
**User Value:** ${formData.question2} - direct problem resolution
**Business Value:** ${formData.question8} - strategic alignment and business impact
**Technical Value:** ${formData.question4} - modern, scalable technical foundation

## Implementation Approach

### Timeline & Methodology
- ${formData.question6.includes('weeks') ? formData.question6.match(/\d+\s*weeks?/g)?.reduce((acc, curr) => acc + parseInt(curr), 0) + ' week' : '12-16 week'} delivery window with agile methodology
- **Phase 1:** Core functionality and basic integrations
- **Phase 2:** Enhanced features and advanced capabilities
- **Flexibility:** Regular review points for scope adjustments

### Communication Plan
**Weekly Standups:** Progress tracking and blocker resolution
**Sprint Reviews:** Demo and stakeholder feedback sessions
**Documentation:** Centralized documentation and version control approach

### Quality Assurance
**Unit Testing:** Automated test coverage for core functionality
**Integration Testing:** End-to-end user journey validation
**User Testing:** Regular feedback sessions with target users

## Open Items & Next Steps

### Immediate Actions
- **Design:** Finalize user interface mockups and user flow diagrams
- **Technical:** ${formData.question4.includes('backend') ? 'Set up backend infrastructure' : 'Initialize development environment'}
- **Stakeholder:** Schedule project kickoff and establish communication cadence
- **Planning:** Create detailed sprint backlog and development roadmap

### Decisions Pending
- **Technical Architecture:** ${formData.question7.includes('API') ? 'API integration approach' : 'Final technical implementation details'}
- **Integration Scope:** ${formData.question7.includes('integration') ? 'Integration complexity and timeline' : 'Third-party service connections'}
- **Resource Allocation:** ${formData.question7.includes('adoption') ? 'User adoption strategy' : 'Team resource planning'}

### Risk Mitigation
- **Technical Risks:** ${formData.question7.split(',')[0] || 'Implementation complexity'} - early prototyping and proof of concept
- **User Adoption:** ${formData.question7.includes('adoption') ? 'User adoption challenges' : 'Change management'} - comprehensive training and support
- **Integration Challenges:** ${formData.question7.includes('API') || formData.question7.includes('integration') ? 'Integration complexity' : 'System compatibility'} - thorough testing and fallback plans

## Meeting Outcomes
Clear alignment achieved on product vision, target users, core functionality, and technical approach. All stakeholders understand the scope boundaries, timeline, and their roles in delivery.

Strong consensus on the phased development approach, which balances early value delivery with manageable complexity and allows for iterative feedback incorporation while maintaining focus on ${formData.question8}.${fileInsights}`;

  return res.json({ prd: templatePRD, source: 'template' });
}
